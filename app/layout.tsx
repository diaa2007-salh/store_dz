// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "متجر الجزائر | Boutique Algérie",
  description: "متجر إلكتروني جزائري متكامل - التسوق الأفضل في الجزائر",
  keywords: ["متجر إلكتروني", "الجزائر", "تسوق", "e-commerce", "algérie"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Sora:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-arabic antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
