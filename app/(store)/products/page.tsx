// app/(store)/products/page.tsx
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/store/Navbar";
import ProductsPageClient from "@/components/store/ProductsPageClient";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string; page?: string };
}) {
  const category = searchParams.category;
  const search = searchParams.search || "";
  const page = parseInt(searchParams.page || "1");
  const limit = 16;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { isActive: true };
  if (category) where.category = { slug: category };
  if (search) {
    where.OR = [
      { titleAr: { contains: search, mode: "insensitive" } },
      { titleFr: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, total, categories, settings] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: [{ isFeatured: "desc" }, { soldCount: "desc" }],
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.settings.findFirst(),
  ]);

  const serialized = products.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-surface-50" dir="rtl">
      <Navbar storeName={settings?.storeNameAr} locale="ar" />
      <ProductsPageClient
        products={serialized}
        categories={categories}
        total={total}
        page={page}
        limit={limit}
        currentCategory={category}
        currentSearch={search}
      />
    </div>
  );
}
