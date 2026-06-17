import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/agent/search - Search properties based on requirements
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { city, locality, bhk, propertyType, transactionType, budget, readyToMove } = body;

    const where: any = { availability: "ACTIVE" };

    if (city) where.city = { contains: city, mode: "insensitive" };
    if (locality) where.locality = { contains: locality, mode: "insensitive" };
    if (bhk) where.bhk = bhk;
    if (propertyType) where.propertyType = propertyType;
    if (transactionType) where.transactionType = transactionType;
    if (budget) where.price = { lte: budget * 1.15 }; // 15% buffer
    if (readyToMove) where.propertyStatus = "READY_TO_MOVE";

    const properties = await prisma.property.findMany({
      where,
      include: {
        images: { take: 3, orderBy: { order: "asc" } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 10,
    });

    return NextResponse.json({
      results: properties.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        bhk: p.bhk,
        propertyType: p.propertyType,
        transactionType: p.transactionType,
        locality: p.locality,
        city: p.city,
        state: p.state,
        area: p.area,
        propertyStatus: p.propertyStatus,
        furnishedStatus: p.furnishedStatus,
        amenities: p.amenities,
        isFeatured: p.isFeatured,
        images: p.images.map((img) => img.url),
        description: p.description?.substring(0, 200),
      })),
      total: properties.length,
    });
  } catch (error) {
    console.error("Error in agent search:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
