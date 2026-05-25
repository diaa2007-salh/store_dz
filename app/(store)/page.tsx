// app/(store)/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDZD } from "@/lib/format";
import Navbar from "@/components/store/Navbar";
import StorefrontClient from "@/components/store/StorefrontClient";

export default async function HomePage() {
  const [featuredProducts, categories, settings] = await Promise.all([
    prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { category: true },
      orderBy: { soldCount: "desc" },
      take: 8,
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.settings.findFirst(),
  ]);

  const serialized = featuredProducts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Navbar storeName={settings?.storeNameAr} locale="ar" />
      <StorefrontClient products={serialized} categories={categories} settings={settings} />
    </div>
  );
}
