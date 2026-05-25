// app/(admin)/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatDZD, formatDate } from "@/lib/format";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

async function getStats() {
  const [
    revenueAgg,
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
    prisma.product.count({ where: { isActive: true, stockCount: { gt: 0, lte: 5 } } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { wilaya: true, items: { take: 1 } },
    }),
  ]);

  // Revenue by day (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dailyOrders = await prisma.order.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { total: true, createdAt: true },
  });

  const revenueByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    revenueByDay[d.toISOString().split("T")[0]] = 0;
  }
  for (const o of dailyOrders) {
    const key = o.createdAt.toISOString().split("T")[0];
    if (key in revenueByDay) revenueByDay[key] += o.total;
  }

  return {
    totalRevenue: revenueAgg._sum.total || 0,
    totalOrders,
    pendingOrders: pendingCount,
    processingOrders: processingCount,
    shippedOrders: shippedCount,
    deliveredOrders: deliveredCount,
    outOfStockProducts: outOfStockCount,
    lowStockProducts: lowStockCount,
    totalProducts,
    recentOrders: recentOrders.map((o) => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    })),
    revenueByDay: Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue })),
  };
}

export default async function DashboardPage() {
  await requireAdmin();
  const stats = await getStats();
  const settings = await prisma.settings.findFirst();

  return (
    <div className="flex min-h-screen bg-surface-50" dir="rtl">
      <AdminSidebar locale="ar" storeName={settings?.storeNameAr || "متجر الجزائر"} />
      <main className="flex-1 pe-64 min-w-0">
        <AdminDashboardClient stats={stats} />
      </main>
    </div>
  );
}
