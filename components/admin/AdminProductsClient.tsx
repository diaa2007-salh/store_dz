// components/admin/AdminProductsClient.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDZD } from "@/lib/format";

interface Product {
  id: string;
  titleAr: string;
  titleFr: string;
  price: number;
  compareAtPrice?: number | null;
  stockCount: number;
  lowStockAlert: number;
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
  soldCount: number;
  category?: { nameAr: string } | null;
  createdAt: string;
}

interface Category {
  id: string;
  nameAr: string;
  nameFr: string;
}

const FILTER_TABS = [
  { key: "", label: "الكل" },
  { key: "featured", label: "⭐ مميز" },
  { key: "low_stock", label: "⚠️ كمية منخفضة" },
  { key: "out_of_stock", label: "🔴 نفدت" },
];

function StockBadge({ stock, alert }: { stock: number; alert: number }) {
  if (stock === 0) return <span className="badge bg-red-100 text-red-600 font-bold">نفد ❌</span>;
  if (stock <= alert) return <span className="badge bg-amber-100 text-amber-700">{stock} ⚠️</span>;
  return <span className="badge bg-green-100 text-green-700">{stock} ✓</span>;
}

export default function AdminProductsClient({
  products: initial,
  total,
  page,
  limit,
  categories,
  currentFilter,
  currentSearch,
}: {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  categories: Category[];
  currentFilter?: string;
  currentSearch?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [products, setProducts] = useState(initial);
  const [search, setSearch] = useState(currentSearch || "");
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockValues, setStockValues] = useState<Record<string, number>>({});

  const totalPages = Math.ceil(total / limit);

  const navigate = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v); });
    startTransition(() => router.push(`/admin/products${sp.toString() ? `?${sp}` : ""}`));
  };

  const handleStockUpdate = async (productId: string) => {
    const newStock = stockValues[productId];
    if (newStock === undefined) { setEditingStock(null); return; }
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockCount: newStock }),
      });
      if (res.ok) {
        setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, stockCount: newStock } : p));
      }
    } finally {
      setEditingStock(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h1>
          <p className="text-gray-500 text-sm mt-1">
            <strong>{total}</strong> منتج · {products.filter((p) => p.stockCount === 0).length} نفد
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة منتج
        </button>
      </div>

      {/* Filters + search */}
      <div className="card p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-1 flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button key={tab.key}
              onClick={() => navigate({ filter: tab.key || undefined, search: search || undefined })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                ${currentFilter === tab.key || (!currentFilter && !tab.key)
                  ? "bg-brand-600 text-white"
                  : "text-gray-500 hover:bg-gray-100"
                }`}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <svg className="absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") navigate({ filter: currentFilter, search: search || undefined }); }}
            placeholder="بحث في المنتجات..."
            className="input-field pe-9 text-sm py-2" />
        </div>
      </div>

      {/* Products table */}
      <div className="card overflow-hidden">
        <div className="table-responsive">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-right">
                {["المنتج", "الفئة", "السعر", "المخزون", "المبيعات", "الحالة", "إجراءات"].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-5xl">📦</span>
                      <p>لا توجد منتجات</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="table-row">
                    {/* Product */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.titleAr} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">📦</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{product.titleAr}</p>
                          <p className="text-xs text-gray-400">{product.titleFr}</p>
                          {product.isFeatured && (
                            <span className="badge bg-yellow-100 text-yellow-700 text-xs mt-0.5">⭐ مميز</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {product.category?.nameAr || <span className="text-gray-300">—</span>}
                    </td>

                    {/* Price */}
                    <td className="px-5 py-3.5">
                      <span className="price-dzd text-sm">{formatDZD(product.price, "ar")}</span>
                      {product.compareAtPrice && (
                        <p className="text-xs text-gray-400 line-through">{formatDZD(product.compareAtPrice, "ar")}</p>
                      )}
                    </td>

                    {/* Stock - inline editable */}
                    <td className="px-5 py-3.5">
                      {editingStock === product.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            defaultValue={product.stockCount}
                            onChange={(e) => setStockValues((prev) => ({ ...prev, [product.id]: Number(e.target.value) }))}
                            className="w-16 text-sm border border-brand-400 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleStockUpdate(product.id);
                              if (e.key === "Escape") setEditingStock(null);
                            }}
                          />
                          <button onClick={() => handleStockUpdate(product.id)}
                            className="text-green-500 hover:text-green-700 p-1">✓</button>
                          <button onClick={() => setEditingStock(null)}
                            className="text-gray-400 hover:text-gray-600 p-1">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setEditingStock(product.id)}
                          className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors group">
                          <StockBadge stock={product.stockCount} alert={product.lowStockAlert} />
                          <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                    </td>

                    {/* Sold */}
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {product.soldCount} مبيع
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={`badge ${product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {product.isActive ? "نشط" : "معطّل"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="تعديل">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
            <p className="text-sm text-gray-500">
              {(page - 1) * limit + 1} – {Math.min(page * limit, total)} من {total}
            </p>
            <div className="flex items-center gap-1">
              <button disabled={page <= 1}
                onClick={() => navigate({ filter: currentFilter, search: search || undefined, page: String(page - 1) })}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                السابق
              </button>
              <button disabled={page >= totalPages}
                onClick={() => navigate({ filter: currentFilter, search: search || undefined, page: String(page + 1) })}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
