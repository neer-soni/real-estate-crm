import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateLeadScore } from "@/lib/lead-scoring";

// POST /api/webhook/lead
// Receives bot output and creates a lead in the CRM, auto-assigned to a client.
//
// Expected body:
// {
//   "userfullName": "John Doe",
//   "phonenumber": "+91 99887 11111",
//   "reason": "Buy",                   <-- "Buy" or "Rent" maps to transactionType
//   "userpreferredArea": "Bangalore",
//   "userbudget": "1.5 Cr",
//   "propertychoice": "2 BHK Apartment", <-- shown as Property Choice in CRM
//   "clientId": "clxxxxx",             <-- Option A: use client's database ID
//   "clientEmail": "agent@firm.com"    <-- Option B: use client's email (auto-lookup)
//   "secret": "YOUR_WEBHOOK_SECRET"    <-- optional security key
// }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Optional: simple secret key protection
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret && body.secret !== webhookSecret) {
      return NextResponse.json({ error: "Unauthorized: invalid secret" }, { status: 401 });
    }

    const {
      userfullName,
      phonenumber,
      reason,
      userpreferredArea,
      userbudget,
      propertychoice,
      clientId,
      clientEmail,
    } = body;

    // All fields are optional - register lead even with minimal info
    const leadName = userfullName || phonenumber || "Unknown Lead";

    // Resolve the client to assign this lead to
    let resolvedClientId: string | null = null;

    if (clientId) {
      const client = await prisma.user.findUnique({ where: { id: clientId } });
      if (!client) {
        return NextResponse.json({ error: `Client not found with id: ${clientId}` }, { status: 404 });
      }
      resolvedClientId = client.id;
    } else if (clientEmail) {
      const client = await prisma.user.findUnique({ where: { email: clientEmail } });
      if (!client) {
        return NextResponse.json({ error: `Client not found with email: ${clientEmail}` }, { status: 404 });
      }
      resolvedClientId = client.id;
    }

    // Map reason → transactionType
    // Accepts: "Buy", "Purchase", "buy", "rent", "Rent", etc.
    function parseTransactionType(reasonStr: string | undefined): "PURCHASE" | "RENT" | null {
      if (!reasonStr) return null;
      const lower = reasonStr.toLowerCase();
      if (lower.includes("buy") || lower.includes("purchase") || lower.includes("own")) return "PURCHASE";
      if (lower.includes("rent") || lower.includes("lease")) return "RENT";
      return null;
    }

    // Parse budget string to number (e.g. "1.5 Cr" => 15000000, "50K" => 50000)
    function parseBudget(budgetStr: string | undefined): number | null {
      if (!budgetStr) return null;
      const s = budgetStr.toString().trim().toUpperCase();
      const num = parseFloat(s.replace(/[^0-9.]/g, ""));
      if (isNaN(num)) return null;
      if (s.includes("CR")) return Math.round(num * 10000000);
      if (s.includes("L")) return Math.round(num * 100000);
      if (s.includes("K")) return Math.round(num * 1000);
      return Math.round(num);
    }

    const budgetValue = parseBudget(userbudget);
    const transactionType = parseTransactionType(reason);

    // propertychoice: handle array or string
    const propertyChoiceStr = Array.isArray(propertychoice)
      ? propertychoice.join(", ")
      : propertychoice || null;

    // Build additional notes
    const additionalNotes = [
      reason ? `Intent: ${reason}` : null,
    ]
      .filter(Boolean)
      .join("\n") || null;

    // Score the lead
    const scoring = calculateLeadScore({
      name: leadName,
      phone: phonenumber,
      budget: budgetValue,
      transactionType,
      preferredLocality: userpreferredArea,
      preferredCity: userpreferredArea,
      preferredPropertyType: propertyChoiceStr,
      additionalNotes,
    } as any);

    // Generate share token
    const shareToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Create the lead
    const lead = await prisma.lead.create({
      data: {
        name: leadName,
        phone: phonenumber || null,
        source: "AI_AGENT",
        budget: budgetValue,
        transactionType: transactionType ?? undefined,
        preferredLocality: userpreferredArea || null,
        preferredCity: userpreferredArea || null,
        preferredPropertyType: propertyChoiceStr || null,
        additionalNotes,
        score: scoring.score,
        classification: scoring.classification,
        purchaseIntent: scoring.purchaseIntent,
        buyingTimeline: scoring.buyingTimeline,
        followUpPriority: scoring.followUpPriority,
        closingProbability: scoring.closingProbability,
        scoringInsights: scoring.insights,
        conversationHistory: JSON.stringify({
          reason,
          transactionType,
          propertychoice: propertyChoiceStr,
          rawBudget: userbudget,
        }),
        shareToken,
      },
    });

    // Auto-assign to the resolved client
    if (resolvedClientId) {
      await prisma.leadAssignment.create({
        data: { leadId: lead.id, userId: resolvedClientId },
      });
    }

    // Fetch client info for response
    let assignedClient = null;
    if (resolvedClientId) {
      assignedClient = await prisma.user.findUnique({
        where: { id: resolvedClientId },
        select: { id: true, name: true, email: true },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Lead created successfully",
        lead: {
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          transactionType: lead.transactionType,
          preferredPropertyType: lead.preferredPropertyType,
          score: lead.score,
          classification: lead.classification,
          status: lead.status,
        },
        assignedTo: assignedClient || "Unassigned (no clientId or clientEmail provided)",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Webhook lead error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
