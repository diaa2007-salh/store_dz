// lib/format.ts

/**
 * Format price in Algerian Dinars (DZD)
 * Uses ar-DZ locale with Arabic numeral formatting
 */
export function formatDZD(amount: number, locale: string = "ar"): string {
  if (locale === "ar") {
    // Arabic format: "4٬500 دج"
    const formatted = new Intl.NumberFormat("ar-DZ", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return `${formatted} دج`;
  }
  // French/English format: "4 500 DA"
  const formatted = new Intl.NumberFormat("fr-DZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} DA`;
}

/**
 * Format date in locale-appropriate format
 */
export function formatDate(date: Date | string, locale: string = "ar"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const localeMap: Record<string, string> = {
    ar: "ar-DZ",
    fr: "fr-DZ",
    en: "en-DZ",
  };
  return new Intl.DateTimeFormat(localeMap[locale] || "ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Generate order number
 */
export function generateOrderNumber(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

/**
 * Get localized name from model
 */
export function getLocalizedName(
  obj: { nameAr: string; nameFr: string; nameEn?: string },
  locale: string = "ar"
): string {
  if (locale === "ar") return obj.nameAr;
  if (locale === "fr") return obj.nameFr;
  return obj.nameEn || obj.nameFr;
}

/**
 * Get localized product title
 */
export function getLocalizedTitle(
  obj: { titleAr: string; titleFr: string; titleEn: string },
  locale: string = "ar"
): string {
  if (locale === "ar") return obj.titleAr;
  if (locale === "fr") return obj.titleFr;
  return obj.titleEn;
}

/**
 * Format wilaya display with code
 */
export function formatWilaya(code: number, name: string): string {
  const paddedCode = String(code).padStart(2, "0");
  return `${paddedCode} - ${name}`;
}
