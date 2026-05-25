// components/admin/AdminLogisticsClient.tsx
"use client";
import { useState, useCallback } from "react";
import { formatDZD } from "@/lib/format";

interface Wilaya {
  id: string;
  code: number;
  nameAr: string;
  nameFr: string;
  homeDeliveryPrice: number;
  deskDeliveryPrice: number;
  isActive: boolean;
}

export default function AdminLogisticsClient({ wilayas: initial }: { wilayas: Wilaya[] }) {
  const [wilayas, setWilayas] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dirty, setDirty] = useState<Set<string>>(new Set());

  const filteredWilayas = wilayas.filter(
    (w) =>
      w.nameAr.includes(search) ||
      w.nameFr.toLowerCase().includes(search.toLowerCase()) ||
      String(w.code).includes(search)
  );

  const updateWilaya = useCallback((id: string, field: keyof Wilaya, value: number | boolean) => {
    setWilayas((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
    setDirty((prev) => new Set(prev).add(id));
    setSaved(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const toSave = wilayas.filter((w) => dirty.has(w.id));
      if (toSave.length === 0) { setSaving(false); return; }

      const res = await fetch("/api/wilayas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wilayas: toSave }),
      });
      if (!res.ok) throw new Error("فشل الحفظ");
      setDirty(new Set());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const toggleAll = (active: boolean) => {
    setWilayas((prev) => prev.map((w) => ({ ...w, isActive: active })));
    setDirty(new Set(wilayas.map((w) => w.id)));
    setSaved(false);
  };

  const activeCount = wilayas.filter((w) => w.isActive).length;
  const avgHome = wilayas.reduce((s, w) => s + w.homeDeliveryPrice, 0) / wilayas.length;
  const avgDesk = wilayas.reduce((s, w) => s + w.deskDeliveryPrice, 0) / wilayas.length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة اللوجستيك</h1>
          <p className="text-gray-500 text-sm mt-1">
            تحكم في أسعار التوصيل وتفعيل الولايات
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dirty.size > 0 && (
            <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full font-medium">
              {dirty.size} تغيير غير محفوظ
            </span>
          )}
          {saved && (
            <span className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
              ✓ تم الحفظ
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || dirty.size === 0}
            className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                جاري الحفظ...
              </>
            ) : "💾 حفظ التغييرات"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "الولايات المفعّلة", value: `${activeCount} / 58`, icon: "✅", color: "bg-green-50" },
          { label: "الولايات المعطّلة", value: `${58 - activeCount}`, icon: "🔴", color: "bg-red-50" },
          { label: "متوسط سعر المنزل", value: formatDZD(Math.round(avgHome), "ar"), icon: "🏠", color: "bg-blue-50" },
          { label: "متوسط سعر المكتب", value: formatDZD(Math.round(avgDesk), "ar"), icon: "🏢", color: "bg-purple-50" },
        ].map((card) => (
          <div key={card.label} className={`${card.color} rounded-2xl p-5 flex items-center gap-4`}>
            <span className="text-3xl">{card.icon}</span>
            <div>
              <p className="text-xs text-gray-500 font-medium">{card.label}</p>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="card p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <svg className="absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالولاية..."
            className="input-field pe-9 text-sm py-2"
          />
        </div>

        {/* Bulk actions */}
        <div className="flex items-center gap-2">
          <button onClick={() => toggleAll(true)}
            className="btn-secondary py-2 px-4 text-xs text-green-600 border-green-200 hover:bg-green-50">
            تفعيل الكل
          </button>
          <button onClick={() => toggleAll(false)}
            className="btn-secondary py-2 px-4 text-xs text-red-500 border-red-200 hover:bg-red-50">
            إيقاف الكل
          </button>
        </div>
      </div>

      {/* Wilaya Price Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-gray-50/50">
          <div className="grid grid-cols-[40px_1fr_1fr_160px_160px_80px] gap-4 w-full items-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span>#</span>
            <span>الولاية</span>
            <span>بالفرنسية</span>
            <span className="text-center">🏠 التوصيل للمنزل (دج)</span>
            <span className="text-center">🏢 استلام المكتب (دج)</span>
            <span className="text-center">الحالة</span>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {filteredWilayas.length === 0 ? (
            <div className="text-center py-12 text-gray-400">لا توجد نتائج</div>
          ) : (
            filteredWilayas.map((wilaya) => {
              const isDirty = dirty.has(wilaya.id);
              return (
                <div
                  key={wilaya.id}
                  className={`grid grid-cols-[40px_1fr_1fr_160px_160px_80px] gap-4 px-6 py-3.5 items-center
                    transition-colors duration-150
                    ${isDirty ? "bg-amber-50/50" : "hover:bg-gray-50/50"}
                    ${!wilaya.isActive ? "opacity-60" : ""}`}
                >
                  {/* Code */}
                  <span className="text-xs font-mono font-bold text-gray-400">
                    {String(wilaya.code).padStart(2, "0")}
                  </span>

                  {/* Arabic name */}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">{wilaya.nameAr}</span>
                    {isDirty && (
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    )}
                  </div>

                  {/* French name */}
                  <span className="text-gray-400 text-sm">{wilaya.nameFr}</span>

                  {/* Home delivery price */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={wilaya.homeDeliveryPrice}
                      min={0}
                      step={50}
                      onChange={(e) => updateWilaya(wilaya.id, "homeDeliveryPrice", Number(e.target.value))}
                      className="w-full text-sm text-center border border-gray-200 rounded-lg px-2 py-1.5
                                 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      disabled={!wilaya.isActive}
                    />
                    <span className="text-xs text-gray-400 whitespace-nowrap">دج</span>
                  </div>

                  {/* Desk price */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={wilaya.deskDeliveryPrice}
                      min={0}
                      step={50}
                      onChange={(e) => updateWilaya(wilaya.id, "deskDeliveryPrice", Number(e.target.value))}
                      className="w-full text-sm text-center border border-gray-200 rounded-lg px-2 py-1.5
                                 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      disabled={!wilaya.isActive}
                    />
                    <span className="text-xs text-gray-400 whitespace-nowrap">دج</span>
                  </div>

                  {/* Active toggle */}
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => updateWilaya(wilaya.id, "isActive", !wilaya.isActive)}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-300
                        ${wilaya.isActive ? "bg-green-500" : "bg-gray-300"}`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm
                          transition-all duration-300
                          ${wilaya.isActive ? "end-0.5" : "start-0.5"}`}
                      />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
