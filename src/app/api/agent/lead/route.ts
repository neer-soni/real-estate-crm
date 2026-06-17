import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateLeadScore } from "@/lib/lead-scoring";

// POST /api/agent/lead - AI Agent creates a lead with conversation data
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, leadData, conversationHistory } = body;

    if (!leadData?.name) {
      return NextResponse.json({ error: "Lead name is required" }, { status: 400 });
    }

    // Calculate lead score
    const scoring = calculateLeadScore(leadData);

    // Search matching properties
    const matchingProperties = await prisma.property.findMany({
      where: {
        availability: "ACTIVE",
        ...(leadData.preferredCity && { city: { contains: leadData.preferredCity, mode: "insensitive" } }),
        ...(leadData.preferredBHK && { bhk: leadData.preferredBHK }),
        ...(leadData.preferredPropertyType && { propertyType: leadData.preferredPropertyType }),
        ...(leadData.transactionType && { transactionType: leadData.transactionType }),
        ...(leadData.budget && { price: { lte: leadData.budget * 1.1 } }),
      },
      include: { images: { take: 1, orderBy: { order: "asc" } } },
      take: 10,
      orderBy: { isFeatured: "desc" },
    });

    // Generate share token
    const shareToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email,
        whatsapp: leadData.whatsapp,
        source: "AI_AGENT",
        budget: leadData.budget,
        budgetMin: leadData.budgetMin,
        budgetMax: leadData.budgetMax,
        transactionType: leadData.transactionType,
        preferredLocality: leadData.preferredLocality,
        preferredCity: leadData.preferredCity,
        preferredBHK: leadData.preferredBHK,
        preferredPropertyType: leadData.preferredPropertyType,
        readyToMoveRequired: leadData.readyToMoveRequired,
        possessionTimeline: leadData.possessionTimeline,
        minArea: leadData.minArea,
        maxArea: leadData.maxArea,
        amenitiesRequired: leadData.amenitiesRequired || [],
        urgencyLevel: leadData.urgencyLevel,
        additionalNotes: leadData.additionalNotes,
        propertyId: matchingProperties[0]?.id,
        score: scoring.score,
        classification: scoring.classification,
        purchaseIntent: scoring.purchaseIntent,
        buyingTimeline: scoring.buyingTimeline,
        followUpPriority: scoring.followUpPriority,
        closingProbability: scoring.closingProbability,
        scoringInsights: scoring.insights,
        conversationHistory: conversationHistory ? JSON.stringify(conversationHistory) : null,
        shareToken,
      },
    });

    // Auto-assign to client if clientId provided
    if (clientId) {
      await prisma.leadAssignment.create({
        data: { leadId: lead.id, userId: clientId },
      });
    }

    return NextResponse.json({
      lead,
      scoring,
      matchingProperties: matchingProperties.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        bhk: p.bhk,
        propertyType: p.propertyType,
        locality: p.locality,
        city: p.city,
        image: p.images[0]?.url,
        isFeatured: p.isFeatured,
      })),
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/shared/lead/${shareToken}`,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating agent lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
