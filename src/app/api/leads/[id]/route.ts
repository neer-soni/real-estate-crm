import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateLeadSchema } from "@/lib/schemas";
import { calculateLeadScore } from "@/lib/lead-scoring";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        property: {
          include: { images: { take: 3, orderBy: { order: "asc" } } },
        },
        notes: {
          include: { user: { select: { name: true, email: true } } },
          orderBy: { createdAt: "desc" },
        },
        assignments: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Check if client can access this lead
    if ((session.user as any).role === "CLIENT") {
      const hasAccess = lead.assignments.some((a) => a.userId === session.user.id);
      const isPropertyOwner = lead.property?.createdById === session.user.id;
      if (!hasAccess && !isPropertyOwner) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const leadToUpdate = await prisma.lead.findUnique({
      where: { id },
      include: { property: true, assignments: true }
    });

    if (!leadToUpdate) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const userRole = (session.user as any).role;
    if (userRole === "CLIENT") {
      const hasAccess = leadToUpdate.assignments.some((a) => a.userId === session.user.id);
      const isPropertyOwner = leadToUpdate.property?.createdById === session.user.id;
      if (!hasAccess && !isPropertyOwner) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const parsed = updateLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Recalculate score
    const scoring = calculateLeadScore(parsed.data as any);

    const lead = await prisma.lead.update({
      where: { id },
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
        assignments: { include: { user: { select: { name: true, email: true } } } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "Lead",
        entityId: id,
        details: `Updated lead: ${lead.name}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    await prisma.lead.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entity: "Lead",
        entityId: id,
        details: `Deleted lead: ${lead.name}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: "Lead deleted" });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
