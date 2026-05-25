// app/(store)/cart/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/store/Navbar";
import CheckoutForm from "@/components/store/CheckoutForm";
import { formatDZD } from "@/lib/format";
import type { CartItem } from "@/types";

function getCartFromStorage(): CartItem[] {
  try {
    const saved = localStorage.getItem("dz-cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try { localStorage.setItem("dz-cart", JSON.stringify(items)); } catch {}
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  useEffect(() => {
    setCart(getCartFromStorage());
    setMounted(true);
  }, []);

  const updateQuantity = (productId: string, delta: number) => {
    const updated = cart.map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.max(1, Math.min(item.quantity + delta, item.stockCount)) }
        : item
    ).filter((i) => i.quantity > 0);
    setCart(updated);
    saveCart(updated);
  };

  const removeItem = (productId: string) => {
    const updated = cart.filter((i) => i.productId !== productId);
    setCart(updated);
    saveCart(updated);
  };

  const clearCart = () => { setCart([]); saveCart([]); };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  const handleOrderSuccess = (orderNumber: string) => {
    setOrderSuccess(orderNumber);
    clearCart();
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white" dir="rtl">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="space-y-4">
            {[1,2,3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  // Order success screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col" dir="rtl">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-md w-full text-center space-y-6 animate-slide-up">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">تم تأكيد طلبك! 🎉</h1>
              <p className="text-gray-500 mb-4">سيتصل بك فريقنا قريباً لتأكيد التوصيل</p>
              <div className="bg-gray-50 rounded-2xl p-4 text-sm">
                <p className="text-gray-500">رقم الطلب</p>
                <p className="font-mono font-bold text-brand-600 text-lg">{orderSuccess}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/products" className="btn-primary">
                🛍️ متابعة التسوق
              </Link>
              <Link href="/" className="btn-secondary">
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (cart.length === 0 && !showCheckout) {
    return (
      <div className="min-h-screen bg-white flex flex-col" dir="rtl">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-sm w-full text-center space-y-6 animate-fade-in">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17
                     m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">السلة فارغة</h2>
              <p className="text-gray-500">أضف منتجات إلى سلتك وابدأ التسوق</p>
            </div>
            <Link href="/products" className="btn-primary block">
              🛍️ تصفح المنتجات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50" dir="rtl">
      <Navbar cartCount={count} cartTotal={subtotal} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          {showCheckout ? "إتمام الطلب" : `سلة التسوق (${count})`}
        </h1>

        {showCheckout ? (
          <CheckoutForm
            items={cart}
            locale="ar"
            onSuccess={handleOrderSuccess}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {cart.map((item) => {
                return (
                  <div key={item.productId} className="card p-4 flex items-center gap-4 animate-fade-in">
                    {/* Image */}
                    <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.titleAr} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{item.titleAr}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{item.titleFr}</p>
                      <p className="price-dzd text-sm font-bold mt-1">{formatDZD(item.price, "ar")}</p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center
                                   text-gray-600 transition-colors font-bold text-lg"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        disabled={item.quantity >= item.stockCount}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center
                                   text-gray-600 transition-colors font-bold text-lg disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    {/* Item total */}
                    <div className="text-end flex-shrink-0">
                      <p className="price-dzd text-sm font-bold">
                        {formatDZD(item.price * item.quantity, "ar")}
                      </p>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5
                             4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}

              {/* Clear cart */}
              <button
                onClick={clearCart}
                className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors"
              >
                🗑️ إفراغ السلة
              </button>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <div className="card p-6 space-y-4">
                <h2 className="font-bold text-gray-900">ملخص الطلب</h2>

                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>المجموع الجزئي ({count} منتج)</span>
                    <span className="price-dzd">{formatDZD(subtotal, "ar")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>الشحن</span>
                    <span className="text-green-600 font-medium">يُحسب عند الشحن</span>
                  </div>
                  <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold text-gray-900">
                    <span>الإجمالي</span>
                    <span className="price-dzd text-lg">{formatDZD(subtotal, "ar")}</span>
                  </div>
                </div>

                {/* COD badge */}
                <div className="flex items-center gap-2.5 p-3 bg-green-50 rounded-xl">
                  <span className="text-xl">💵</span>
                  <div>
                    <p className="text-green-700 text-sm font-semibold">الدفع عند الاستلام</p>
                    <p className="text-green-600 text-xs">لا تحتاج لبطاقة بنكية</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCheckout(true)}
                  className="btn-primary w-full text-base py-3.5"
                >
                  إتمام الشراء ←
                </button>

                <Link href="/products" className="block text-center text-brand-600 text-sm font-medium hover:underline">
                  ← متابعة التسوق
                </Link>
              </div>

              {/* Trust signals */}
              <div className="card p-4 space-y-2.5">
                {[
                  { icon: "🚚", text: "توصيل سريع لجميع الولايات" },
                  { icon: "🔒", text: "بياناتك محمية ومؤمنة" },
                  { icon: "🔄", text: "إرجاع مجاني خلال 7 أيام" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
