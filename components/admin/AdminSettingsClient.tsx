// components/admin/AdminSettingsClient.tsx
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema, type SettingsInput } from "@/lib/validations";

interface Settings {
  id?: string;
  storeNameAr: string;
  storeNameFr: string;
  storeNameEn: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  whatsapp?: string | null;
}

function FieldSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <span className="text-2xl">{icon}</span>
        <h2 className="font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({
  label, error, children, hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function AdminSettingsClient({ settings }: { settings: Settings | null }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeNameAr: settings?.storeNameAr || "",
      storeNameFr: settings?.storeNameFr || "",
      storeNameEn: settings?.storeNameEn || "",
      email: settings?.email || "",
      phone: settings?.phone || "",
      address: settings?.address || "",
      facebook: settings?.facebook || "",
      instagram: settings?.instagram || "",
      tiktok: settings?.tiktok || "",
      whatsapp: settings?.whatsapp || "",
    },
  });

  const onSubmit = async (data: SettingsInput) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("فشل الحفظ");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إعدادات المتجر</h1>
            <p className="text-gray-500 text-sm mt-1">تخصيص معلومات وهوية متجرك</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-green-600 bg-green-50 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                تم الحفظ
              </span>
            )}
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="btn-primary flex items-center gap-2 py-2.5 px-6 text-sm"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري الحفظ...
                </>
              ) : "💾 حفظ الإعدادات"}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
        )}

        {/* Store Names */}
        <FieldSection title="اسم المتجر (متعدد اللغات)" icon="🏪">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="الاسم بالعربية *" error={errors.storeNameAr?.message}>
              <input
                {...register("storeNameAr")}
                className={`input-field ${errors.storeNameAr ? "input-error" : ""}`}
                placeholder="مثال: متجر الجزائر"
                dir="rtl"
              />
            </Field>
            <Field label="الاسم بالفرنسية *" error={errors.storeNameFr?.message}>
              <input
                {...register("storeNameFr")}
                className={`input-field ${errors.storeNameFr ? "input-error" : ""}`}
                placeholder="Ex: Boutique Algérie"
                dir="ltr"
              />
            </Field>
            <Field label="الاسم بالإنجليزية *" error={errors.storeNameEn?.message}>
              <input
                {...register("storeNameEn")}
                className={`input-field ${errors.storeNameEn ? "input-error" : ""}`}
                placeholder="Ex: Algeria Store"
                dir="ltr"
              />
            </Field>
          </div>
        </FieldSection>

        {/* Contact Info */}
        <FieldSection title="معلومات التواصل" icon="📞">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="رقم الهاتف" hint="للعرض في صفحة التواصل">
              <input
                {...register("phone")}
                className="input-field"
                placeholder="0555 00 00 00"
                dir="ltr"
                type="tel"
              />
            </Field>
            <Field label="واتساب" hint="رقم واتساب للتواصل المباشر">
              <div className="relative">
                <span className="absolute top-1/2 -translate-y-1/2 start-3 text-green-500">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M11.999 0C5.373 0 0 5.373 0 12c0 2.124.556 4.118 1.527 5.845L.057 23.882l6.198-1.624A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 11.999 0zm0 22c-1.844 0-3.571-.484-5.062-1.328l-.363-.215-3.684.966.98-3.593-.233-.373A9.96 9.96 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z" />
                  </svg>
                </span>
                <input
                  {...register("whatsapp")}
                  className="input-field ps-10"
                  placeholder="0555000000"
                  dir="ltr"
                  type="tel"
                />
              </div>
            </Field>
            <Field label="البريد الإلكتروني" error={errors.email?.message}>
              <input
                {...register("email")}
                className={`input-field ${errors.email ? "input-error" : ""}`}
                placeholder="contact@store.dz"
                type="email"
                dir="ltr"
              />
            </Field>
            <Field label="العنوان الفيزيائي">
              <input
                {...register("address")}
                className="input-field"
                placeholder="الجزائر العاصمة، الجزائر"
              />
            </Field>
          </div>
        </FieldSection>

        {/* Social Media */}
        <FieldSection title="وسائل التواصل الاجتماعي" icon="📱">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "facebook" as const, label: "فيسبوك", placeholder: "https://facebook.com/yourpage", emoji: "👍", color: "text-blue-600" },
              { name: "instagram" as const, label: "إنستغرام", placeholder: "https://instagram.com/yourhandle", emoji: "📸", color: "text-pink-600" },
              { name: "tiktok" as const, label: "تيكتوك", placeholder: "https://tiktok.com/@yourhandle", emoji: "🎵", color: "text-gray-900" },
            ].map((social) => (
              <Field key={social.name} label={social.label} error={(errors as any)[social.name]?.message}>
                <div className="relative">
                  <span className={`absolute top-1/2 -translate-y-1/2 start-3 text-lg ${social.color}`}>
                    {social.emoji}
                  </span>
                  <input
                    {...register(social.name)}
                    className={`input-field ps-10 ${(errors as any)[social.name] ? "input-error" : ""}`}
                    placeholder={social.placeholder}
                    dir="ltr"
                    type="url"
                  />
                </div>
              </Field>
            ))}
          </div>
        </FieldSection>

        {/* Yalidine API Config info */}
        <div className="card p-6 border-2 border-dashed border-gray-200">
          <div className="flex items-start gap-4">
            <span className="text-3xl">🚚</span>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">إعدادات Yalidine API</h3>
              <p className="text-sm text-gray-500 mb-3">
                تُضبط بيانات ربط Yalidine عبر متغيرات البيئة (.env) لأسباب أمنية.
              </p>
              <div className="font-mono text-xs bg-gray-900 text-green-400 p-4 rounded-xl space-y-1">
                <p>YALIDINE_API_ID=<span className="text-yellow-300">your_api_id</span></p>
                <p>YALIDINE_API_TOKEN=<span className="text-yellow-300">your_api_token</span></p>
                <p>YALIDINE_SENDER_WILAYA_ID=<span className="text-yellow-300">16</span> <span className="text-gray-500"># الجزائر</span></p>
                <p>YALIDINE_SENDER_NAME=<span className="text-yellow-300">"متجر الجزائر"</span></p>
                <p>YALIDINE_SENDER_PHONE=<span className="text-yellow-300">0555000000</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
