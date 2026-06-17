import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH /api/properties/status - Update property availability (sold, active, disabled)
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, availability } = await req.json();

    if (!id || !availability) {
      return NextResponse.json({ error: "id and availability required" }, { status: 400 });
    }

    const validStatuses = ["ACTIVE", "DISABLED", "SOLD"];
    if (!validStatuses.includes(availability)) {
      return NextResponse.json({ error: "Invalid availability status" }, { status: 400 });
    }

    const property = await prisma.property.update({
      where: { id },
      data: { availability },
    });

    await prisma.auditLog.create({
      data: {
        action: "STATUS_CHANGE",
        entity: "Property",
        entityId: id,
        details: `Changed availability to: ${availability}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error("Error updating property status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
