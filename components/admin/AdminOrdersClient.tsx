// components/admin/AdminOrdersClient.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDZD, formatDate } from "@/lib/format";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  wilaya?: { nameAr: string; code: number } | null;
  shippingType: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
  trackingCode?: string | null;
  createdAt: string;
  items: { titleAr: string; quantity: number }[];
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  pending:    { label: "قيد الانتظار",  cls: "badge-pending" },
  processing: { label: "قيد المعالجة", cls: "badge-processing" },
  shipped:    { label: "تم الشحن",      cls: "badge-shipped" },
  delivered:  { label: "تم التوصيل",   cls: "badge-delivered" },
  cancelled:  { label: "ملغى",          cls: "badge-cancelled" },
  returned:   { label: "مُعاد",         cls: "badge-returned" },
};

const STATUS_TABS = [
  { key: "", label: "الكل" },
  { key: "pending", label: "انتظار" },
  { key: "processing", label: "معالجة" },
  { key: "shipped", label: "شحن" },
  { key: "delivered", label: "مُسلَّم" },
  { key: "cancelled", label: "ملغى" },
];

function YalidineButton({ orderId, onSuccess }: { orderId: string; onSuccess: (tracking: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleShip = async () => {
    if (!confirm("هل تريد إرسال هذا الطلب إلى يالدين؟")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/yalidine`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الإرسال");
      onSuccess(data.trackingCode);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ");
      setTimeout(() => setError(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button onClick={handleShip} disabled={loading} className="btn-yalidine whitespace-nowrap">
        {loading ? (
          <>
            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            جاري الإرسال...
          </>
        ) : (
          <>🚚 شحن عبر يالدين</>
        )}
      </button>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

function StatusUpdater({ orderId, currentStatus, onUpdate }: {
  orderId: string;
  currentStatus: string;
  onUpdate: (newStatus: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleChange = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) onUpdate(newStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={currentStatus}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white
                 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer
                 disabled:opacity-50"
    >
      {Object.entries(statusConfig).map(([key, { label }]) => (
        <option key={key} value={key}>{label}</option>
      ))}
    </select>
  );
}

export default function AdminOrdersClient({
  orders: initialOrders,
  total,
  page,
  limit,
  currentStatus,
  currentSearch,
}: {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  currentStatus?: string;
  currentSearch?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState(currentSearch || "");

  const totalPages = Math.ceil(total / limit);

  const navigate = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    if (params.status) sp.set("status", params.status);
    if (params.search) sp.set("search", params.search);
    if (params.page && params.page !== "1") sp.set("page", params.page);
    startTransition(() => {
      router.push(`/admin/orders${sp.toString() ? `?${sp.toString()}` : ""}`);
    });
  };

  const handleTrackingUpdate = (orderId: string, trackingCode: string) => {
    setOrders((prev) =>
      prev.map((o) => o.id === orderId
        ? { ...o, trackingCode, status: "processing" }
        : o
      )
    );
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)
    );
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الطلبات</h1>
          <p className="text-gray-500 text-sm mt-1">
            إجمالي <strong>{total}</strong> طلب
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Status tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => navigate({ status: tab.key || undefined, search: search || undefined })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                ${currentStatus === tab.key || (!currentStatus && !tab.key)
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <svg className="absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate({ status: currentStatus, search: search || undefined });
            }}
            placeholder="بحث برقم الطلب، الاسم، الهاتف..."
            className="input-field pe-9 text-sm py-2"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="table-responsive">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/80 text-right border-b border-gray-100">
                {["رقم الطلب", "العميل", "المنتجات", "الولاية", "النوع", "المبلغ", "التتبع / الشحن", "الحالة", "التاريخ"].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="skeleton h-4 rounded-lg w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <span className="text-5xl">📭</span>
                      <p className="font-medium">لا توجد طلبات</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const cfg = statusConfig[order.status] || statusConfig.pending;
                  const needsShipping = ["pending", "processing"].includes(order.status) && !order.trackingCode;

                  return (
                    <tr key={order.id} className="table-row">
                      {/* Order number */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-bold text-brand-600">
                          {order.orderNumber}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">{order.customerName}</p>
                        <p className="text-xs text-gray-400 font-mono">{order.customerPhone}</p>
                      </td>

                      {/* Products */}
                      <td className="px-5 py-4 max-w-[160px]">
                        <p className="text-xs text-gray-600 truncate">
                          {order.items.map((i) => `${i.titleAr} ×${i.quantity}`).join("، ")}
                        </p>
                      </td>

                      {/* Wilaya */}
                      <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {order.wilaya
                          ? `${String(order.wilaya.code).padStart(2, "0")} - ${order.wilaya.nameAr}`
                          : "—"}
                      </td>

                      {/* Shipping type */}
                      <td className="px-5 py-4">
                        <span className={`badge text-xs ${order.shippingType === "home" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                          {order.shippingType === "home" ? "🏠 منزل" : "🏢 مكتب"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <span className="price-dzd text-sm font-bold">{formatDZD(order.total, "ar")}</span>
                        <p className="text-xs text-gray-400">
                          + {formatDZD(order.shippingCost, "ar")} شحن
                        </p>
                      </td>

                      {/* Tracking / Yalidine */}
                      <td className="px-5 py-4 min-w-[160px]">
                        {order.trackingCode ? (
                          <div className="flex items-center gap-1.5">
                            <span className="status-dot bg-purple-400" />
                            <span className="font-mono text-xs text-purple-700 font-semibold">
                              {order.trackingCode}
                            </span>
                          </div>
                        ) : needsShipping ? (
                          <YalidineButton
                            orderId={order.id}
                            onSuccess={(tracking) => handleTrackingUpdate(order.id, tracking)}
                          />
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className={cfg.cls}>{cfg.label}</span>
                          <StatusUpdater
                            orderId={order.id}
                            currentStatus={order.status}
                            onUpdate={(s) => handleStatusUpdate(order.id, s)}
                          />
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(order.createdAt, "ar")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
            <p className="text-sm text-gray-500">
              عرض {(page - 1) * limit + 1} – {Math.min(page * limit, total)} من {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => navigate({ status: currentStatus, search: search || undefined, page: String(page - 1) })}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40
                           hover:bg-gray-50 transition-colors"
              >
                السابق
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <button key={p} onClick={() => navigate({ status: currentStatus, search: search || undefined, page: String(p) })}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                      ${p === page ? "bg-brand-600 text-white" : "hover:bg-gray-100 text-gray-600"}`}>
                    {p}
                  </button>
                );
              })}
              <button
                disabled={page >= totalPages}
                onClick={() => navigate({ status: currentStatus, search: search || undefined, page: String(page + 1) })}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40
                           hover:bg-gray-50 transition-colors"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
