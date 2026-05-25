// components/store/CheckoutForm.tsx
"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDZD } from "@/lib/format";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import type { Wilaya, Commune, CartItem } from "@/types";

interface CheckoutFormProps {
  items: CartItem[];
  locale?: string;
  onSuccess?: (orderNumber: string) => void;
}

type Step = 1 | 2 | 3;

export default function CheckoutForm({ items, locale = "ar", onSuccess }: CheckoutFormProps) {
  const [step, setStep] = useState<Step>(1);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [selectedWilaya, setSelectedWilaya] = useState<Wilaya | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isRTL = locale === "ar";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { shippingType: "home" },
  });

  const watchedWilayaId = watch("wilayaId");
  const watchedShippingType = watch("shippingType");

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + shippingCost;

  const labels = {
    ar: {
      step1: "البيانات الشخصية", step2: "عنوان التوصيل", step3: "تأكيد الطلب",
      name: "الاسم الكامل", phone: "رقم الهاتف", email: "البريد الإلكتروني (اختياري)",
      wilaya: "الولاية", commune: "البلدية", address: "العنوان التفصيلي (اختياري)",
      shippingMethod: "طريقة الاستلام",
      home: "توصيل للمنزل", homeDesc: "يصلك المنتج لباب المنزل",
      desk: "استلام من المكتب", deskDesc: "استلم من أقرب مكتب يالدين",
      payment: "طريقة الدفع",
      cod: "الدفع عند الاستلام (COD)", codDesc: "ادفع نقداً عند استلامك للطلب",
      subtotal: "المجموع", shipping: "الشحن", total: "الإجمالي",
      next: "التالي", back: "رجوع", confirm: "تأكيد الطلب",
      namePlaceholder: "مثال: أحمد بوعلام",
      phonePlaceholder: "مثال: 0661234567",
      emailPlaceholder: "email@example.com",
      addressPlaceholder: "الحي، الشارع، رقم البناية...",
      loadingWilayas: "جاري التحميل...",
      selectWilaya: "اختر الولاية",
      selectCommune: "اختر البلدية",
      notes: "ملاحظات (اختياري)",
      notesPlaceholder: "أي تعليمات خاصة بالطلب...",
      free: "مجاناً",
    },
    fr: {
      step1: "Informations", step2: "Livraison", step3: "Confirmation",
      name: "Nom Complet", phone: "Téléphone", email: "Email (optionnel)",
      wilaya: "Wilaya", commune: "Commune", address: "Adresse détaillée (optionnel)",
      shippingMethod: "Mode de livraison",
      home: "Livraison à domicile", homeDesc: "Livraison à votre adresse",
      desk: "Retrait en bureau", deskDesc: "Retrait au bureau Yalidine le plus proche",
      payment: "Mode de paiement",
      cod: "Paiement à la livraison (COD)", codDesc: "Payez en espèces à la réception",
      subtotal: "Sous-total", shipping: "Livraison", total: "Total",
      next: "Suivant", back: "Retour", confirm: "Confirmer la commande",
      namePlaceholder: "Ex: Ahmed Boualem",
      phonePlaceholder: "Ex: 0661234567",
      emailPlaceholder: "email@example.com",
      addressPlaceholder: "Quartier, rue, numéro...",
      loadingWilayas: "Chargement...",
      selectWilaya: "Choisir la wilaya",
      selectCommune: "Choisir la commune",
      notes: "Notes (optionnel)",
      notesPlaceholder: "Instructions spéciales...",
      free: "Gratuit",
    },
    en: {
      step1: "Information", step2: "Shipping", step3: "Confirmation",
      name: "Full Name", phone: "Phone Number", email: "Email (optional)",
      wilaya: "Wilaya", commune: "Commune", address: "Detailed Address (optional)",
      shippingMethod: "Shipping method",
      home: "Home Delivery", homeDesc: "Delivered to your door",
      desk: "Office Pickup", deskDesc: "Pick up at nearest Yalidine office",
      payment: "Payment method",
      cod: "Cash on Delivery (COD)", codDesc: "Pay cash when you receive your order",
      subtotal: "Subtotal", shipping: "Shipping", total: "Total",
      next: "Next", back: "Back", confirm: "Place Order",
      namePlaceholder: "e.g. Ahmed Boualem",
      phonePlaceholder: "e.g. 0661234567",
      emailPlaceholder: "email@example.com",
      addressPlaceholder: "Street, building number...",
      loadingWilayas: "Loading...",
      selectWilaya: "Select wilaya",
      selectCommune: "Select commune",
      notes: "Notes (optional)",
      notesPlaceholder: "Special instructions...",
      free: "Free",
    },
  };

  const L = labels[locale as keyof typeof labels] || labels.ar;

  // Load wilayas on mount
  useEffect(() => {
    setLoading(true);
    fetch("/api/wilayas?active=true")
      .then((r) => r.json())
      .then((data) => { setWilayas(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Update communes and shipping cost when wilaya changes
  useEffect(() => {
    if (!watchedWilayaId) {
      setCommunes([]);
      setSelectedWilaya(null);
      return;
    }
    const found = wilayas.find((w) => w.id === watchedWilayaId);
    setSelectedWilaya(found || null);
    setCommunes(found?.communes || []);
    setValue("communeId", "");

    // Update shipping cost
    if (found) {
      const cost = watchedShippingType === "home"
        ? found.homeDeliveryPrice
        : found.deskDeliveryPrice;
      setShippingCost(cost);
    }
  }, [watchedWilayaId, wilayas, setValue, watchedShippingType]);

  // Update shipping cost when type changes
  useEffect(() => {
    if (selectedWilaya) {
      const cost = watchedShippingType === "home"
        ? selectedWilaya.homeDeliveryPrice
        : selectedWilaya.deskDeliveryPrice;
      setShippingCost(cost);
    }
  }, [watchedShippingType, selectedWilaya]);

  const goNext = async () => {
    const fieldsToValidate: (keyof CheckoutInput)[][] = [
      ["customerName", "customerPhone", "customerEmail"],
      ["wilayaId", "shippingType"],
      [],
    ];
    const valid = await trigger(fieldsToValidate[step - 1]);
    if (valid) setStep((s) => Math.min(s + 1, 3) as Step);
  };

  const onSubmit = async (data: CheckoutInput) => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items: items.map((i) => ({
            productId: i.productId,
            titleAr: i.titleAr,
            titleFr: i.titleFr,
            titleEn: i.titleEn,
            price: i.price,
            quantity: i.quantity,
            imageUrl: i.imageUrl,
          })),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to place order");
      onSuccess?.(result.order.orderNumber);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setSubmitting(false);
    }
  };

  // Step indicator
  const steps = [L.step1, L.step2, L.step3];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-0 mb-8">
        {steps.map((label, i) => {
          const num = i + 1;
          const isActive = num === step;
          const isDone = num < step;
          return (
            <div key={i} className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`step-indicator ${isDone ? "step-done" : isActive ? "step-active" : "step-pending"}`}>
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : num}
                </div>
                <span className={`text-xs font-medium ${isActive ? "text-brand-600" : isDone ? "text-green-600" : "text-gray-400"}`}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-colors duration-300
                  ${isDone ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="card p-6 animate-slide-up space-y-4">
            <h2 className="font-bold text-lg text-gray-900 mb-2">{L.step1}</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{L.name} *</label>
              <input
                {...register("customerName")}
                className={`input-field ${errors.customerName ? "input-error" : ""}`}
                placeholder={L.namePlaceholder}
                dir={isRTL ? "rtl" : "ltr"}
              />
              {errors.customerName && (
                <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{L.phone} *</label>
              <input
                {...register("customerPhone")}
                className={`input-field ${errors.customerPhone ? "input-error" : ""}`}
                placeholder={L.phonePlaceholder}
                type="tel"
                dir="ltr"
              />
              {errors.customerPhone && (
                <p className="text-red-500 text-xs mt-1">{errors.customerPhone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{L.email}</label>
              <input
                {...register("customerEmail")}
                className={`input-field ${errors.customerEmail ? "input-error" : ""}`}
                placeholder={L.emailPlaceholder}
                type="email"
                dir="ltr"
              />
              {errors.customerEmail && (
                <p className="text-red-500 text-xs mt-1">{errors.customerEmail.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{L.notes}</label>
              <textarea
                {...register("notes")}
                className="input-field resize-none"
                rows={3}
                placeholder={L.notesPlaceholder}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
          </div>
        )}

        {/* Step 2: Shipping */}
        {step === 2 && (
          <div className="card p-6 animate-slide-up space-y-5">
            <h2 className="font-bold text-lg text-gray-900 mb-2">{L.step2}</h2>

            {/* Wilaya */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{L.wilaya} *</label>
              <select
                {...register("wilayaId")}
                className={`input-field ${errors.wilayaId ? "input-error" : ""}`}
                dir={isRTL ? "rtl" : "ltr"}
              >
                <option value="">{loading ? L.loadingWilayas : L.selectWilaya}</option>
                {wilayas.map((w) => (
                  <option key={w.id} value={w.id}>
                    {String(w.code).padStart(2, "0")} - {locale === "ar" ? w.nameAr : locale === "fr" ? w.nameFr : w.nameEn}
                  </option>
                ))}
              </select>
              {errors.wilayaId && (
                <p className="text-red-500 text-xs mt-1">{errors.wilayaId.message}</p>
              )}
            </div>

            {/* Commune */}
            {communes.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{L.commune}</label>
                <select
                  {...register("communeId")}
                  className="input-field"
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <option value="">{L.selectCommune}</option>
                  {communes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {locale === "ar" ? c.nameAr : locale === "fr" ? c.nameFr : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{L.address}</label>
              <textarea
                {...register("addressDetails")}
                className="input-field resize-none"
                rows={2}
                placeholder={L.addressPlaceholder}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>

            {/* Shipping method */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">{L.shippingMethod} *</label>
              <div className="grid grid-cols-2 gap-3">
                {(["home", "desk"] as const).map((type) => {
                  const isSelected = watchedShippingType === type;
                  const price = selectedWilaya
                    ? type === "home" ? selectedWilaya.homeDeliveryPrice : selectedWilaya.deskDeliveryPrice
                    : null;
                  return (
                    <label
                      key={type}
                      className={`relative flex flex-col gap-1.5 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                        ${isSelected ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <input
                        type="radio"
                        value={type}
                        {...register("shippingType")}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 self-end absolute top-3 end-3
                        ${isSelected ? "border-brand-500 bg-brand-500" : "border-gray-300"}`}>
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full absolute top-0.5 left-0.5" />
                        )}
                      </div>
                      <span className="text-2xl">{type === "home" ? "🏠" : "🏢"}</span>
                      <span className="font-semibold text-sm text-gray-900">
                        {type === "home" ? L.home : L.desk}
                      </span>
                      <span className="text-xs text-gray-500">
                        {type === "home" ? L.homeDesc : L.deskDesc}
                      </span>
                      {price !== null && (
                        <span className={`text-sm font-bold mt-1 ${isSelected ? "text-brand-600" : "text-gray-600"}`}>
                          {price === 0 ? L.free : formatDZD(price, locale)}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Payment */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">{L.payment}</label>
              <div className={`flex items-center gap-4 p-4 rounded-xl border-2 border-green-400 bg-green-50`}>
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{L.cod}</p>
                  <p className="text-xs text-gray-500">{L.codDesc}</p>
                </div>
                <div className="ms-auto">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="card p-6 animate-slide-up space-y-5">
            <h2 className="font-bold text-lg text-gray-900 mb-2">{L.step3}</h2>

            {/* Items */}
            <div className="space-y-3">
              {items.map((item) => {
                const title = locale === "ar" ? item.titleAr : locale === "fr" ? item.titleFr : item.titleEn;
                return (
                  <div key={item.productId} className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">📦</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{title}</p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                    <span className="price-dzd text-sm flex-shrink-0">
                      {formatDZD(item.price * item.quantity, locale)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className={`flex justify-between text-sm text-gray-600 ${isRTL ? "flex-row-reverse" : ""}`}>
                <span>{L.subtotal}</span>
                <span className="price-dzd">{formatDZD(subtotal, locale)}</span>
              </div>
              <div className={`flex justify-between text-sm text-gray-600 ${isRTL ? "flex-row-reverse" : ""}`}>
                <span>{L.shipping}</span>
                <span className={shippingCost === 0 ? "text-green-600 font-semibold" : "price-dzd"}>
                  {shippingCost === 0 ? L.free : formatDZD(shippingCost, locale)}
                </span>
              </div>
              <div className={`flex justify-between font-bold text-lg text-gray-900 border-t border-gray-100 pt-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                <span>{L.total}</span>
                <span className="price-dzd text-xl">{formatDZD(total, locale)}</span>
              </div>
            </div>

            {/* COD badge */}
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
              <span className="text-green-600 text-lg">✓</span>
              <span className="text-green-700 text-sm font-medium">{L.cod}</span>
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm border border-red-200">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className={`flex gap-3 mt-4 ${isRTL ? "flex-row-reverse" : ""}`}>
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(s - 1, 1) as Step)}
              className="btn-secondary flex-1"
            >
              {L.back}
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className="btn-primary flex-1"
            >
              {L.next}
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 relative"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {locale === "ar" ? "جاري الإرسال..." : "En cours..."}
                </span>
              ) : L.confirm}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
