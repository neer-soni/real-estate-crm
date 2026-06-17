import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH /api/properties/feature - Toggle featured status
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, isFeatured } = await req.json();

    if (!id || typeof isFeatured !== "boolean") {
      return NextResponse.json({ error: "id and isFeatured required" }, { status: 400 });
    }

    const property = await prisma.property.update({
      where: { id },
      data: { isFeatured },
    });

    await prisma.auditLog.create({
      data: {
        action: "FEATURE_TOGGLE",
        entity: "Property",
        entityId: id,
        details: `${isFeatured ? "Featured" : "Unfeatured"} property`,
        userId: session.user.id,
      },
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error("Error toggling feature:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
