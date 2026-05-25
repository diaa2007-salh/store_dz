// components/admin/AdminDashboardClient.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import { formatDZD, formatDate } from "@/lib/format";

interface StatsData {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  totalProducts: number;
  recentOrders: any[];
  revenueByDay: { date: string; revenue: number }[];
}

const statusConfig: Record<string, { label: string; cls: string; dot: string }> = {
  pending:    { label: "قيد الانتظار",  cls: "badge-pending",    dot: "bg-amber-400" },
  processing: { label: "قيد المعالجة", cls: "badge-processing", dot: "bg-blue-400" },
  shipped:    { label: "تم الشحن",      cls: "badge-shipped",    dot: "bg-purple-400" },
  delivered:  { label: "تم التوصيل",   cls: "badge-delivered",  dot: "bg-green-400" },
  cancelled:  { label: "ملغى",          cls: "badge-cancelled",  dot: "bg-red-400" },
  returned:   { label: "مُعاد",         cls: "badge-returned",   dot: "bg-gray-400" },
};

function StatCard({
  title, value, sub, icon, color, trend,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; label: string };
}) {
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full
            ${trend.value >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboardClient({ stats }: { stats: StatsData }) {
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  const chartData = stats.revenueByDay.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("ar-DZ", { weekday: "short", day: "numeric" }),
  }));

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString("ar-DZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link href="/admin/orders" className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إدارة الطلبات
        </Link>
      </div>

      {/* Alert banners */}
      {(stats.outOfStockProducts > 0 || stats.lowStockProducts > 0) && (
        <div className="space-y-2">
          {stats.outOfStockProducts > 0 && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
              <span className="text-red-500 text-xl">⚠️</span>
              <p className="text-red-700 text-sm font-medium">
                تنبيه: <strong>{stats.outOfStockProducts}</strong> منتج نفد من المخزون
              </p>
              <Link href="/admin/products?filter=out_of_stock" className="ms-auto text-red-600 text-sm font-semibold hover:underline">
                عرض المنتجات
              </Link>
            </div>
          )}
          {stats.lowStockProducts > 0 && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fade-in">
              <span className="text-amber-500 text-xl">📦</span>
              <p className="text-amber-700 text-sm font-medium">
                تحذير: <strong>{stats.lowStockProducts}</strong> منتج على وشك النفاد
              </p>
              <Link href="/admin/products?filter=low_stock" className="ms-auto text-amber-600 text-sm font-semibold hover:underline">
                عرض المنتجات
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي الإيرادات"
          value={formatDZD(stats.totalRevenue, "ar")}
          sub={`من ${stats.deliveredOrders + stats.shippedOrders} طلب منجز`}
          color="bg-brand-50"
          icon={
            <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend={{ value: 12, label: "هذا الأسبوع" }}
        />
        <StatCard
          title="إجمالي الطلبات"
          value={stats.totalOrders}
          sub={`${stats.pendingOrders} قيد الانتظار`}
          color="bg-blue-50"
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          title="طلبات تحتاج شحن"
          value={stats.pendingOrders + stats.processingOrders}
          sub="في انتظار الإرسال عبر يالدين"
          color="bg-amber-50"
          icon={
            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          }
        />
        <StatCard
          title="نفاد المخزون"
          value={stats.outOfStockProducts}
          sub={`${stats.lowStockProducts} منتج بكمية منخفضة`}
          color="bg-red-50"
          icon={
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
      </div>

      {/* Order Status Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { status: "pending",    count: stats.pendingOrders },
          { status: "processing", count: stats.processingOrders },
          { status: "shipped",    count: stats.shippedOrders },
          { status: "delivered",  count: stats.deliveredOrders },
        ].map(({ status, count }) => {
          const cfg = statusConfig[status];
          return (
            <Link key={status} href={`/admin/orders?status=${status}`}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100
                         hover:shadow-card transition-all duration-200 group">
              <span className={`status-dot ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{cfg.label}</p>
                <p className="text-lg font-bold text-gray-900">{count}</p>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors rotate-180"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-gray-900">إيرادات آخر 7 أيام</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              إجمالي: <span className="text-brand-600 font-semibold">{formatDZD(stats.totalRevenue, "ar")}</span>
            </p>
          </div>
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            {(["area", "bar"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                  ${chartType === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {t === "area" ? "📈 خطي" : "📊 أعمدة"}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          {chartType === "area" ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e74f41" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#e74f41" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,.08)" }}
                formatter={(value: number) => [formatDZD(value, "ar"), "الإيرادات"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#e74f41" strokeWidth={2.5}
                fill="url(#revenueGrad)" dot={{ fill: "#e74f41", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }} />
            </AreaChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                formatter={(value: number) => [formatDZD(value, "ar"), "الإيرادات"]}
                cursor={{ fill: "rgba(231,79,65,0.05)" }}
              />
              <Bar dataKey="revenue" fill="#e74f41" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-900">آخر الطلبات</h2>
          <Link href="/admin/orders" className="text-brand-600 text-sm font-semibold hover:underline">
            عرض الكل
          </Link>
        </div>
        <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 text-right">
                {["رقم الطلب", "العميل", "الولاية", "المبلغ", "الحالة", "التاريخ"].map((h) => (
                  <th key={h} className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    لا توجد طلبات بعد
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((order: any) => {
                  const cfg = statusConfig[order.status] || statusConfig.pending;
                  return (
                    <tr key={order.id} className="table-row">
                      <td className="px-6 py-3.5">
                        <Link href={`/admin/orders/${order.id}`}
                          className="text-brand-600 font-mono text-sm font-semibold hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-400">{order.customerPhone}</p>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-600">
                        {order.wilaya?.nameAr || "—"}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="price-dzd text-sm">{formatDZD(order.total, "ar")}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={cfg.cls}>{cfg.label}</span>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(order.createdAt, "ar")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
