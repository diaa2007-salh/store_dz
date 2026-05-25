// components/store/StorefrontClient.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDZD } from "@/lib/format";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import type { Product, CartItem } from "@/types";

interface StorefrontClientProps {
  products: any[];
  categories: any[];
  settings: any;
}

// Simple in-memory cart store (production: use Zustand + localStorage)
let cartStore: CartItem[] = [];
const cartListeners: (() => void)[] = [];
function getCart() { return cartStore; }
function setCart(items: CartItem[]) {
  cartStore = items;
  cartListeners.forEach((l) => l());
  try { localStorage.setItem("dz-cart", JSON.stringify(items)); } catch {}
}
function initCart() {
  try {
    const saved = localStorage.getItem("dz-cart");
    if (saved) cartStore = JSON.parse(saved);
  } catch {}
}

export function useCart() {
  const [cart, setCartState] = useState<CartItem[]>([]);
  useEffect(() => {
    initCart();
    setCartState([...cartStore]);
    const listener = () => setCartState([...cartStore]);
    cartListeners.push(listener);
    return () => {
      const idx = cartListeners.indexOf(listener);
      if (idx !== -1) cartListeners.splice(idx, 1);
    };
  }, []);

  const addToCart = (product: any) => {
    const existing = cartStore.find((i) => i.productId === product.id);
    if (existing) {
      setCart(cartStore.map((i) =>
        i.productId === product.id
          ? { ...i, quantity: Math.min(i.quantity + 1, product.stockCount) }
          : i
      ));
    } else {
      setCart([...cartStore, {
        productId: product.id,
        titleAr: product.titleAr,
        titleFr: product.titleFr,
        titleEn: product.titleEn,
        price: product.price,
        quantity: 1,
        imageUrl: product.images?.[0],
        stockCount: product.stockCount,
      }]);
    }
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  return { cart, addToCart, total, count };
}

// Toast notification
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);
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

export default function StorefrontClient({ products, categories, settings }: StorefrontClientProps) {
  const { cart, addToCart, total, count } = useCart();
  const [toast, setToast] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleAddToCart = (product: any) => {
    addToCart(product);
    setToast(`✓ أُضيف "${product.titleAr}" إلى السلة`);
  };

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category?.slug === activeCategory)
    : products;

  return (
    <>
      {/* Floating cart button */}
      {count > 0 && (
        <div className="fixed bottom-6 start-6 z-50 animate-slide-up">
          <Link
            href="/cart"
            className="flex items-center gap-3 bg-brand-600 hover:bg-brand-700 text-white
                       px-5 py-3 rounded-2xl shadow-brand transition-all duration-200
                       hover:shadow-lg hover:-translate-y-0.5"
          >
            <span className="font-bold text-sm">{formatDZD(total, "ar")}</span>
            <div className="w-px h-4 bg-white/30" />
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184
                   1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="bg-white text-brand-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {count}
            </span>
          </Link>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-brand-950 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 start-0 w-96 h-96 bg-brand-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 end-0 w-96 h-96 bg-brand-600 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20
                            text-brand-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse-brand" />
              تسوق في الجزائر · Acheter en Algérie
            </div>

            <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-6">
              {settings?.storeNameAr || "متجر الجزائر"}
              <span className="block text-brand-400 text-2xl lg:text-3xl font-bold mt-2">
                {settings?.storeNameFr || "Boutique Algérie"}
              </span>
            </h1>

            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              أفضل المنتجات بأسعار منافسة، مع توصيل سريع لجميع ولايات الجزائر عبر يالدين
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href="/products"
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-8 py-4
                           rounded-2xl transition-all duration-200 shadow-brand hover:shadow-lg
                           hover:-translate-y-0.5 text-sm"
              >
                🛍️ تسوق الآن
              </Link>
              <Link
                href="/products"
                className="border border-white/20 hover:border-white/40 text-white/80 hover:text-white
                           font-semibold px-6 py-4 rounded-2xl transition-all duration-200 text-sm"
              >
                عرض المنتجات
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6 mt-10 text-gray-500 text-xs">
              {["🚚 توصيل سريع", "💵 الدفع عند الاستلام", "🔄 إرجاع مضمون", "📞 دعم متواصل"].map((badge) => (
                <span key={badge} className="flex items-center gap-1 whitespace-nowrap">{badge}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200
                ${!activeCategory ? "bg-brand-600 text-white shadow-brand" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              الكل
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200
                  ${activeCategory === cat.slug
                    ? "bg-brand-600 text-white shadow-brand"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {cat.nameAr}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {activeCategory ? categories.find((c) => c.slug === activeCategory)?.nameAr : "المنتجات المميزة"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {filteredProducts.length} منتج متاح
            </p>
          </div>
          <Link href="/products" className="text-brand-600 font-semibold text-sm hover:underline flex items-center gap-1">
            عرض الكل
            <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <span className="text-6xl block mb-4">🔍</span>
            <p className="font-medium">لا توجد منتجات في هذه الفئة</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {filteredProducts.map((product, i) => (
              <div key={product.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-fade-in">
                <ProductCard
                  product={product}
                  locale="ar"
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">ج</span>
                </div>
                <span className="text-white font-bold">{settings?.storeNameAr || "متجر الجزائر"}</span>
              </div>
              <p className="text-sm leading-relaxed">
                متجر إلكتروني جزائري متكامل مع توصيل لجميع الولايات
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                {["الرئيسية", "المنتجات", "تتبع طلبي", "تواصل معنا"].map((l) => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">الشحن والتوصيل</h4>
              <ul className="space-y-2 text-sm">
                <li>🚚 توصيل لجميع الولايات</li>
                <li>🏢 استلام من مكاتب يالدين</li>
                <li>💵 الدفع عند الاستلام</li>
                <li>🔄 إرجاع خلال 7 أيام</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">تواصل معنا</h4>
              <div className="space-y-2 text-sm">
                {settings?.phone && <p>📞 {settings.phone}</p>}
                {settings?.whatsapp && <p>💬 واتساب: {settings.whatsapp}</p>}
                {settings?.email && <p>✉️ {settings.email}</p>}
              </div>
              {/* Social links */}
              <div className="flex items-center gap-3 mt-4">
                {settings?.facebook && (
                  <a href={settings.facebook} target="_blank" rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors text-lg">👍</a>
                )}
                {settings?.instagram && (
                  <a href={settings.instagram} target="_blank" rel="noopener noreferrer"
                    className="text-gray-400 hover:text-pink-400 transition-colors text-lg">📸</a>
                )}
                {settings?.tiktok && (
                  <a href={settings.tiktok} target="_blank" rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors text-lg">🎵</a>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs">
              © {new Date().getFullYear()} {settings?.storeNameAr || "متجر الجزائر"} · جميع الحقوق محفوظة
            </p>
            <p className="text-xs text-gray-600">
              مدعوم بتقنية يالدين للشحن السريع 🚚
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
