// components/store/ProductsPageClient.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import { useCart } from "./StorefrontClient";
import Link from "next/link";
import { formatDZD } from "@/lib/format";

interface ProductsPageClientProps {
  products: any[];
  categories: any[];
  total: number;
  page: number;
  limit: number;
  currentCategory?: string;
  currentSearch?: string;
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 end-6 z-50 animate-slide-up">
      <div className="bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-modal flex items-center gap-3">
        <span className="text-green-400">✓</span>
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white ms-2">✕</button>
      </div>
    </div>
  );
}

export default function ProductsPageClient({
  products,
  categories,
  total,
  page,
  limit,
  currentCategory,
  currentSearch,
}: ProductsPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch || "");
  const [toast, setToast] = useState("");
  const { addToCart, count: cartCount, total: cartTotal } = useCart();

  const totalPages = Math.ceil(total / limit);

  const navigate = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v); });
    startTransition(() => router.push(`/products${sp.toString() ? `?${sp}` : ""}`));
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
    setToast(`✓ أُضيف "${product.titleAr}" إلى السلة`);
    setTimeout(() => setToast(""), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      {/* Floating cart */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 start-6 z-40">
          <Link href="/cart"
            className="flex items-center gap-3 bg-brand-600 text-white px-5 py-3 rounded-2xl shadow-brand">
            <span className="font-bold text-sm">{formatDZD(cartTotal, "ar")}</span>
            <span className="badge bg-white/20 text-white">{cartCount}</span>
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentCategory
              ? categories.find((c) => c.slug === currentCategory)?.nameAr || "المنتجات"
              : "جميع المنتجات"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{total} منتج متاح</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <svg className="absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                navigate({ category: currentCategory, search: search || undefined });
            }}
            placeholder="ابحث عن منتج..."
            className="input-field pe-9 text-sm py-2.5 bg-white"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        <button
          onClick={() => navigate({ search: search || undefined })}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all
            ${!currentCategory ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
        >
          الكل ({total})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate({ category: currentCategory === cat.slug ? undefined : cat.slug, search: search || undefined })}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all
              ${currentCategory === cat.slug
                ? "bg-brand-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
          >
            {cat.nameAr}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {isPending ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">🔍</span>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد منتجات</h3>
          <p className="text-gray-500 text-sm mb-6">جرب تعديل معايير البحث</p>
          <button onClick={() => navigate({})} className="btn-secondary">إعادة ضبط الفلتر</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, i) => (
              <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                <ProductCard product={product} locale="ar" onAddToCart={handleAddToCart} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                disabled={page <= 1}
                onClick={() => navigate({ category: currentCategory, search: search || undefined, page: String(page - 1) })}
                className="px-4 py-2 rounded-xl text-sm border border-gray-200 disabled:opacity-40 hover:bg-white transition-colors bg-white"
              >
                السابق
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => navigate({ category: currentCategory, search: search || undefined, page: String(p) })}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors
                    ${p === page ? "bg-brand-600 text-white" : "bg-white hover:bg-gray-100 text-gray-600 border border-gray-200"}`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page >= totalPages}
                onClick={() => navigate({ category: currentCategory, search: search || undefined, page: String(page + 1) })}
                className="px-4 py-2 rounded-xl text-sm border border-gray-200 disabled:opacity-40 hover:bg-white transition-colors bg-white"
              >
                التالي
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
