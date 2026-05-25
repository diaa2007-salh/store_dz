// components/store/ProductCard.tsx
"use client";
import { useState } from "react";
import { formatDZD } from "@/lib/format";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  locale?: string;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, locale = "ar", onAddToCart }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const title = locale === "ar" ? product.titleAr : locale === "fr" ? product.titleFr : product.titleEn;
  const isOutOfStock = product.stockCount === 0;
  const isLowStock = product.stockCount > 0 && product.stockCount <= product.lowStockAlert;
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  const handleAddToCart = async () => {
    if (isOutOfStock || adding) return;
    setAdding(true);
    await new Promise((r) => setTimeout(r, 300));
    onAddToCart?.(product);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const addLabel =
    adding ? "..." :
    added ? (locale === "ar" ? "✓ أُضيف" : locale === "fr" ? "✓ Ajouté" : "✓ Added") :
    locale === "ar" ? "أضف للسلة" : locale === "fr" ? "Ajouter" : "Add to Cart";

  return (
    <div className="product-card flex flex-col animate-fade-in">
      {/* Image */}
      <div className="product-image-wrap relative aspect-square bg-gray-50">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14
                   m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 start-3 flex flex-col gap-1.5">
          {discount && (
            <span className="bg-brand-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
              -{discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-gold-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
              ★ {locale === "ar" ? "مميز" : "Vedette"}
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-800 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
              {locale === "ar" ? "نفدت" : "Épuisé"}
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
              {locale === "ar" ? `${product.stockCount} متبقي` : `${product.stockCount} restant`}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 text-sm">{title}</h3>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((star) => (
                <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(product.rating) ? "text-gold-500" : "text-gray-300"}`}
                     fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0
                           1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54
                           1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1
                           1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-400">({product.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className={`flex items-baseline gap-2 ${locale === "ar" ? "flex-row-reverse justify-end" : ""} mt-auto`}>
          <span className="price-dzd text-lg">{formatDZD(product.price, locale)}</span>
          {product.compareAtPrice && (
            <span className="text-gray-400 text-sm line-through">{formatDZD(product.compareAtPrice, locale)}</span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || adding}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
            ${isOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : added
              ? "bg-green-500 text-white shadow-md"
              : "btn-primary"
            }`}
        >
          {isOutOfStock
            ? (locale === "ar" ? "نفدت الكمية" : locale === "fr" ? "Épuisé" : "Out of Stock")
            : addLabel
          }
        </button>
      </div>
    </div>
  );
}

// Skeleton loader
export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-4 flex flex-col gap-3">
        <div className="skeleton h-4 rounded-lg w-3/4" />
        <div className="skeleton h-3 rounded-lg w-1/2" />
        <div className="skeleton h-6 rounded-lg w-1/3" />
        <div className="skeleton h-10 rounded-xl" />
      </div>
    </div>
  );
}
