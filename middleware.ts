// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const ADMIN_PATHS = ["/admin"];
const AUTH_PATHS = ["/auth/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));

  const token = req.cookies.get("auth-token")?.value;
  const session = token ? await verifyToken(token) : null;

  // Redirect unauthenticated users away from admin routes
  if (isAdminPath) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Redirect authenticated admins away from login page
  if (isAuthPath && session?.role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/auth/:path*"],
};
