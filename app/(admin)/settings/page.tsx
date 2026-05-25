// app/(admin)/settings/page.tsx
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminSettingsClient from "@/components/admin/AdminSettingsClient";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const [settings] = await Promise.all([prisma.settings.findFirst()]);

  return (
    <div className="flex min-h-screen bg-surface-50" dir="rtl">
      <AdminSidebar locale="ar" storeName={settings?.storeNameAr} />
      <main className="flex-1 pe-64 min-w-0">
        <AdminSettingsClient settings={settings} />
      </main>
    </div>
  );
}
