// app/(store)/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "متجر الجزائر | Boutique Algérie",
  description: "أفضل متجر إلكتروني في الجزائر — توصيل سريع لجميع الولايات",
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
