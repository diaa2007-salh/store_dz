// app/(admin)/orders/page.tsx
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminOrdersClient from "@/components/admin/AdminOrdersClient";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string; page?: string };
}) {
  await requireAdmin();

  const status = searchParams.status;
  const search = searchParams.search || "";
  const page = parseInt(searchParams.page || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { customerPhone: { contains: search } },
      { trackingCode: { contains: search, mode: "insensitive" } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { wilaya: true, commune: true, items: { take: 2 } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  const settings = await prisma.settings.findFirst();

  const serialized = orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    items: o.items.map((i) => ({
      ...i,
      createdAt: i.createdAt.toISOString(),
    })),
  }));

  return (
    <div className="flex min-h-screen bg-surface-50" dir="rtl">
      <AdminSidebar locale="ar" storeName={settings?.storeNameAr} />
      <main className="flex-1 pe-64 min-w-0">
        <AdminOrdersClient
          orders={serialized}
          total={total}
          page={page}
          limit={limit}
          currentStatus={status}
          currentSearch={search}
        />
      </main>
    </div>
  );
}
