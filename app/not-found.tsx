// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-5xl">🔍</span>
        </div>
        <div>
          <h1 className="text-6xl font-black text-gray-900 mb-2">404</h1>
          <h2 className="text-xl font-bold text-gray-700 mb-2">الصفحة غير موجودة</h2>
          <p className="text-gray-500">عذراً، لا يمكن العثور على الصفحة التي تبحث عنها</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">العودة للرئيسية</Link>
          <Link href="/products" className="btn-secondary">تصفح المنتجات</Link>
        </div>
      </div>
    </div>
  );
}
