// app/(admin)/products/page.tsx
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminProductsClient from "@/components/admin/AdminProductsClient";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { filter?: string; search?: string; page?: string };
}) {
  await requireAdmin();

  const filter = searchParams.filter;
  const search = searchParams.search || "";
  const page = parseInt(searchParams.page || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { isActive: true };
  if (filter === "out_of_stock") where.stockCount = 0;
  if (filter === "low_stock") where.stockCount = { gt: 0, lte: 5 };
  if (filter === "featured") where.isFeatured = true;
  if (search) {
    where.OR = [
      { titleAr: { contains: search, mode: "insensitive" } },
      { titleFr: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const settings = await prisma.settings.findFirst();

  const serialized = products.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="flex min-h-screen bg-surface-50" dir="rtl">
      <AdminSidebar locale="ar" storeName={settings?.storeNameAr} />
      <main className="flex-1 pe-64 min-w-0">
        <AdminProductsClient
          products={serialized}
          total={total}
          page={page}
          limit={limit}
          categories={categories}
          currentFilter={filter}
          currentSearch={search}
        />
      </main>
    </div>
  );
}
