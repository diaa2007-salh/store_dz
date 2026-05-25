// app/(admin)/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة التحكم | متجر الجزائر",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
