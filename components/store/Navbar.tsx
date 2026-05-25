// components/store/Navbar.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { formatDZD } from "@/lib/format";

interface NavbarProps {
  locale?: string;
  cartCount?: number;
  cartTotal?: number;
  storeName?: string;
}

const localeLabels = { ar: "عربي", fr: "FR", en: "EN" };

export default function Navbar({
  locale = "ar",
  cartCount = 0,
  cartTotal = 0,
  storeName = "متجر الجزائر",
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const isRTL = locale === "ar";

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between h-16 ${isRTL ? "" : "flex-row-reverse"}`}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl
                            flex items-center justify-center shadow-brand group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">ج</span>
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:block">{storeName}</span>
          </Link>

          {/* Desktop nav */}
          <nav className={`hidden md:flex items-center gap-1 ${isRTL ? "" : "flex-row-reverse"}`}>
            {[
              { href: "/", label: locale === "ar" ? "الرئيسية" : locale === "fr" ? "Accueil" : "Home" },
              { href: "/products", label: locale === "ar" ? "المنتجات" : locale === "fr" ? "Produits" : "Products" },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="nav-link text-sm">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                           text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                {localeLabels[locale as keyof typeof localeLabels]}
              </button>
              {langOpen && (
                <div className={`absolute top-full mt-1 bg-white rounded-xl shadow-modal border border-gray-100 py-1 min-w-[100px] z-50
                                ${isRTL ? "right-0" : "left-0"}`}>
                  {(["ar", "fr", "en"] as const).map((l) => (
                    <Link
                      key={l}
                      href={`?lang=${l}`}
                      onClick={() => setLangOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors
                                  ${l === locale ? "text-brand-600 font-semibold" : "text-gray-600"}`}
                    >
                      {localeLabels[l]}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Cart button */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-4 py-2 bg-brand-50 hover:bg-brand-100
                         text-brand-600 rounded-xl transition-colors group"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17
                     m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <>
                  <span className="text-sm font-semibold">{formatDZD(cartTotal, locale)}</span>
                  <span className="absolute -top-1.5 -start-1.5 w-5 h-5 bg-brand-600 text-white
                                   text-xs rounded-full flex items-center justify-center font-bold shadow-sm">
                    {cartCount}
                  </span>
                </>
              )}
              {cartCount === 0 && (
                <span className="text-sm font-medium">
                  {locale === "ar" ? "السلة" : locale === "fr" ? "Panier" : "Cart"}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 animate-fade-in">
            {[
              { href: "/", label: locale === "ar" ? "الرئيسية" : "Accueil" },
              { href: "/products", label: locale === "ar" ? "المنتجات" : "Produits" },
              { href: "/cart", label: locale === "ar" ? "السلة" : "Panier" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
