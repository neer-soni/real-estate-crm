import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH /api/leads/status - Update lead status in pipeline
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, status } = await req.json();
    const validStatuses = ["NEW", "CONTACTED", "MEETING_SCHEDULED", "SITE_VISIT", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"];

    if (!id || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid id or status" }, { status: 400 });
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        action: "STATUS_CHANGE",
        entity: "Lead",
        entityId: id,
        details: `Changed lead status to: ${status}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error updating lead status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
