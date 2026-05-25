// app/auth/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "فشل تسجيل الدخول");
      if (result.user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-brand-950 flex items-center justify-center px-4" dir="rtl">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 end-1/4 w-96 h-96 bg-brand-800/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-modal">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl
                            flex items-center justify-center shadow-brand mb-4">
              <span className="text-white font-black text-3xl">ج</span>
            </div>
            <h1 className="text-white font-bold text-xl">لوحة التحكم</h1>
            <p className="text-gray-400 text-sm mt-1">سجل دخولك للمتابعة</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                البريد الإلكتروني
              </label>
              <input
                {...register("email")}
                type="email"
                dir="ltr"
                placeholder="admin@dz-store.dz"
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder:text-gray-500
                           focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-200
                           ${errors.email ? "border-red-500" : "border-white/10 hover:border-white/20"}`}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                كلمة المرور
              </label>
              <input
                {...register("password")}
                type="password"
                dir="ltr"
                placeholder="••••••••"
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder:text-gray-500
                           focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-200
                           ${errors.password ? "border-red-500" : "border-white/10 hover:border-white/20"}`}
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <span className="text-red-400 text-sm">⚠️ {error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl
                         transition-all duration-200 shadow-brand disabled:opacity-50 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-gray-900
                         flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري الدخول...
                </>
              ) : (
                "تسجيل الدخول →"
              )}
            </button>
          </form>

          {/* Default credentials hint */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-gray-500 text-xs text-center mb-2">بيانات الدخول الافتراضية</p>
            <div className="font-mono text-xs text-gray-400 space-y-1 text-center">
              <p>📧 admin@dz-store.dz</p>
              <p>🔒 Admin@123</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a href="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
              ← العودة للمتجر
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
