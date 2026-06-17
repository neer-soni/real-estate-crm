import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/leads/analytics - Analytics data for leads
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalLeads,
      hotLeads,
      warmLeads,
      coldLeads,
      statusCounts,
      sourceCounts,
      recentLeads,
      monthlyLeads,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { classification: "HOT" } }),
      prisma.lead.count({ where: { classification: "WARM" } }),
      prisma.lead.count({ where: { classification: "COLD" } }),
      prisma.lead.groupBy({ by: ["status"], _count: true }),
      prisma.lead.groupBy({ by: ["source"], _count: true }),
      prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, score: true, classification: true, status: true, createdAt: true },
      }),
      // Last 6 months of leads
      prisma.$queryRaw`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YYYY') as month,
          COUNT(*)::int as count
        FROM "Lead"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt") ASC
      ` as Promise<Array<{ month: string; count: number }>>,
    ]);

    const closedWon = statusCounts.find((s) => s.status === "CLOSED_WON")?._count || 0;
    const conversionRate = totalLeads > 0 ? ((closedWon / totalLeads) * 100).toFixed(1) : "0";

    return NextResponse.json({
      totalLeads,
      hotLeads,
      warmLeads,
      coldLeads,
      conversionRate: parseFloat(conversionRate),
      statusBreakdown: statusCounts.map((s) => ({ status: s.status, count: s._count })),
      sourceBreakdown: sourceCounts.map((s) => ({ source: s.source, count: s._count })),
      recentLeads,
      monthlyLeads,
    });
  } catch (error) {
    console.error("Error fetching lead analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
