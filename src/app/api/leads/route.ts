import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createLeadSchema } from "@/lib/schemas";
import { calculateLeadScore } from "@/lib/lead-scoring";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const classification = searchParams.get("classification") || "";
    const source = searchParams.get("source") || "";
    const city = searchParams.get("city") || "";
    const sortBy = searchParams.get("sortBy") || "newest";

    const userRole = (session.user as any).role;
    const where: any = {};

    // Clients only see leads assigned to them
    if (userRole === "CLIENT") {
      where.assignments = {
        some: { userId: session.user.id },
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { preferredCity: { contains: search, mode: "insensitive" } },
        { preferredLocality: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) where.status = status;
    if (classification) where.classification = classification;
    if (source) where.source = source;
    if (city) where.preferredCity = { contains: city, mode: "insensitive" };

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "oldest") orderBy = { createdAt: "asc" };
    if (sortBy === "scoreDesc") orderBy = { score: "desc" };
    if (sortBy === "scoreAsc") orderBy = { score: "asc" };

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          property: { select: { name: true, locality: true, city: true } },
          assignments: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
          _count: { select: { notes: true } },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Calculate lead score
    const scoring = calculateLeadScore(parsed.data);

    const lead = await prisma.lead.create({
      data: {
        ...parsed.data,
        moveInDate: parsed.data.moveInDate ? new Date(parsed.data.moveInDate) : undefined,
        score: scoring.score,
        classification: scoring.classification,
        purchaseIntent: scoring.purchaseIntent,
        buyingTimeline: scoring.buyingTimeline,
        followUpPriority: scoring.followUpPriority,
        closingProbability: scoring.closingProbability,
        scoringInsights: scoring.insights,
      },
      include: {
        property: { select: { name: true } },
        assignments: { include: { user: { select: { name: true, email: true } } } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "Lead",
        entityId: lead.id,
        details: `Created lead: ${lead.name} (Score: ${scoring.score}, ${scoring.classification})`,
        userId: session.user.id,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
