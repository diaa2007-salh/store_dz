// app/(admin)/logistics/page.tsx
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminLogisticsClient from "@/components/admin/AdminLogisticsClient";

export default async function AdminLogisticsPage() {
  await requireAdmin();
  const [wilayas, settings] = await Promise.all([
    prisma.wilaya.findMany({ orderBy: { code: "asc" } }),
    prisma.settings.findFirst(),
  ]);

  return (
    <div className="flex min-h-screen bg-surface-50" dir="rtl">
      <AdminSidebar locale="ar" storeName={settings?.storeNameAr} />
      <main className="flex-1 pe-64 min-w-0">
        <AdminLogisticsClient wilayas={wilayas} />
      </main>
    </div>
  );
}
