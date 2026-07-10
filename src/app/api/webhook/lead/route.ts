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
//   "reason": "Buy a flat",
//   "userpreferredArea": "Bangalore",
//   "userbudget": "1.5 Cr",
//   "propertychoice": "2 BHK Apartment",
//   "clientId": "clxxxxx",          <-- Option A: use client's database ID
//   "clientEmail": "agent@firm.com" <-- Option B: use client's email (auto-lookup)
//   "secret": "YOUR_WEBHOOK_SECRET" <-- optional security key
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

    if (!userfullName) {
      return NextResponse.json({ error: "userfullName is required" }, { status: 400 });
    }

    // Resolve the client to assign this lead to
    let resolvedClientId: string | null = null;

    if (clientId) {
      // Option A: direct client ID
      const client = await prisma.user.findUnique({ where: { id: clientId } });
      if (!client) {
        return NextResponse.json({ error: `Client not found with id: ${clientId}` }, { status: 404 });
      }
      resolvedClientId = client.id;
    } else if (clientEmail) {
      // Option B: lookup by email
      const client = await prisma.user.findUnique({ where: { email: clientEmail } });
      if (!client) {
        return NextResponse.json({ error: `Client not found with email: ${clientEmail}` }, { status: 404 });
      }
      resolvedClientId = client.id;
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

    // Build notes
    const additionalNotes = [
      reason ? `Task/Reason: ${reason}` : null,
      propertychoice ? `Property Choice: ${propertychoice}` : null,
    ]
      .filter(Boolean)
      .join("\n") || null;

    // Score the lead
    const scoring = calculateLeadScore({
      name: userfullName,
      phone: phonenumber,
      budget: budgetValue,
      preferredLocality: userpreferredArea,
      preferredCity: userpreferredArea,
      additionalNotes,
    } as any);

    // Generate share token
    const shareToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Create the lead
    const lead = await prisma.lead.create({
      data: {
        name: userfullName,
        phone: phonenumber || null,
        source: "AI_AGENT",
        budget: budgetValue,
        preferredLocality: userpreferredArea || null,
        preferredCity: userpreferredArea || null,
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
          propertychoice,
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

    // Fetch the client name for the response
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
