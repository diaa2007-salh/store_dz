// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdminFromRequest(req);

    const [
      totalRevenue,
      totalOrders,
      pendingCount,
      processingCount,
      shippedCount,
      deliveredCount,
      outOfStockCount,
      lowStockCount,
      totalProducts,
      recentOrders,
    ] = await Promise.all([
      // Total revenue from delivered + shipped orders
      prisma.order.aggregate({
        where: { status: { in: ["delivered", "shipped", "processing"] } },
        _sum: { total: true },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.order.count({ where: { status: "processing" } }),
      prisma.order.count({ where: { status: "shipped" } }),
      prisma.order.count({ where: { status: "delivered" } }),
      prisma.product.count({ where: { stockCount: 0, isActive: true } }),
      prisma.product.count({
        where: {
          isActive: true,
          stockCount: { gt: 0 },
          AND: [{ stockCount: { lte: prisma.product.fields.lowStockAlert } }],
        },
      }).catch(() => prisma.product.count({ where: { isActive: true, stockCount: { gt: 0, lte: 5 } } })),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { wilaya: true, items: { take: 1 } },
      }),
    ]);

    // Revenue by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: { in: ["delivered", "shipped", "processing", "pending"] },
      },
      select: { total: true, createdAt: true },
    });

    const revenueByDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      revenueByDay[key] = 0;
    }

    for (const order of dailyOrders) {
      const key = order.createdAt.toISOString().split("T")[0];
      if (key in revenueByDay) {
        revenueByDay[key] += order.total;
      }
    }

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.total || 0,
      totalOrders,
      pendingOrders: pendingCount,
      processingOrders: processingCount,
      shippedOrders: shippedCount,
      deliveredOrders: deliveredCount,
      outOfStockProducts: outOfStockCount,
      lowStockProducts: lowStockCount,
      totalProducts,
      recentOrders,
      revenueByDay: Object.entries(revenueByDay).map(([date, revenue]) => ({
        date,
        revenue,
      })),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
