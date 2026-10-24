import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Routes that are accessible only to non-authenticated users
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/learn",
];

// Set MAINTENANCE_MODE=false to take the site out of maintenance.
const maintenanceMode = process.env.MAINTENANCE_MODE !== "false";

export default auth((req) => {
  const { nextUrl } = req;

  if (maintenanceMode) {
    const isStaticFile = /\.[a-z0-9]+$/i.test(nextUrl.pathname);
    if (nextUrl.pathname === "/maintenance" || isStaticFile) {
      return NextResponse.next();
    }
    return NextResponse.rewrite(new URL("/maintenance", nextUrl), {
      status: 503,
      headers: { "Retry-After": "3600" },
    });
  }
  const isLoggedIn = !!req.auth;

  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isProtectedRoute = protectedRoutes.some(route => nextUrl.pathname.startsWith(route));

  // If the user is logged in and tries to access an auth route, redirect them to the dashboard
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // If the user is not logged in and tries to access a protected route, redirect them to login
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
