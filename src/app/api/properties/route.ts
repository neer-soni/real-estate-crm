import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createPropertySchema } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const propertyType = searchParams.get("propertyType") || "";
    const transactionType = searchParams.get("transactionType") || "";
    const bhk = searchParams.get("bhk") || "";
    const availability = searchParams.get("availability") || "";
    const propertyStatus = searchParams.get("propertyStatus") || "";
    const locality = searchParams.get("locality") || "";
    const city = searchParams.get("city") || "";
    const builderName = searchParams.get("builderName") || "";
    const isFeatured = searchParams.get("isFeatured") || "";
    const priceMin = searchParams.get("priceMin") || "";
    const priceMax = searchParams.get("priceMax") || "";
    const sortBy = searchParams.get("sortBy") || "newest";

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { builderName: { contains: search, mode: "insensitive" } },
        { locality: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    if (propertyType) where.propertyType = propertyType;
    if (transactionType) where.transactionType = transactionType;
    if (bhk) where.bhk = bhk;
    if (availability) where.availability = availability;
    if (propertyStatus) where.propertyStatus = propertyStatus;
    if (locality) where.locality = { contains: locality, mode: "insensitive" };
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (builderName) where.builderName = { contains: builderName, mode: "insensitive" };
    if (isFeatured === "true") where.isFeatured = true;
    if (priceMin) where.price = { ...where.price, gte: parseFloat(priceMin) };
    if (priceMax) where.price = { ...where.price, lte: parseFloat(priceMax) };

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "oldest") orderBy = { createdAt: "asc" };
    if (sortBy === "priceAsc") orderBy = { price: "asc" };
    if (sortBy === "priceDesc") orderBy = { price: "desc" };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: { orderBy: { order: "asc" }, take: 5 },
          createdBy: { select: { name: true, email: true } },
          _count: { select: { leads: true } },
        },
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      properties,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createPropertySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const property = await prisma.property.create({
      data: {
        ...parsed.data,
        createdById: session.user.id,
      },
      include: {
        images: true,
        createdBy: { select: { name: true, email: true } },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "Property",
        entityId: property.id,
        details: `Created property: ${property.name}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
