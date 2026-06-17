import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH /api/leads/assign - Assign lead to client(s)
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { leadId, userIds } = await req.json();

    if (!leadId || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "leadId and userIds[] required" }, { status: 400 });
    }

    // Remove existing assignments
    await prisma.leadAssignment.deleteMany({ where: { leadId } });

    // Create new assignments
    await prisma.leadAssignment.createMany({
      data: userIds.map((userId: string) => ({
        leadId,
        userId,
      })),
      skipDuplicates: true,
    });

    // Generate a share token if not already present
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (lead && !lead.shareToken) {
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      await prisma.lead.update({
        where: { id: leadId },
        data: { shareToken: token },
      });
    }

    await prisma.auditLog.create({
      data: {
        action: "ASSIGN",
        entity: "Lead",
        entityId: leadId,
        details: `Assigned to ${userIds.length} client(s)`,
        userId: session.user.id,
      },
    });

    const updated = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        assignments: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error assigning lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
