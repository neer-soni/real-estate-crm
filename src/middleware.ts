import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isAuthPage = nextUrl.pathname.startsWith("/login");
  const isDashboard = nextUrl.pathname.startsWith("/dashboard");
  const isApi = nextUrl.pathname.startsWith("/api");
  const isPublic = nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/_next") || nextUrl.pathname.startsWith("/favicon");

  // Allow API routes and public paths
  if (isApi || isPublic) return NextResponse.next();

  // Redirect logged-in users away from auth pages
  if (isAuthPage) {
    if (isLoggedIn) {
      const redirectUrl = userRole === "SUPER_ADMIN"
        ? "/dashboard/properties"
        : "/dashboard/leads";
      return NextResponse.redirect(new URL(redirectUrl, nextUrl));
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // RBAC: Block clients from admin-only routes
  if (isLoggedIn && userRole === "CLIENT") {
    const adminOnlyPaths = [
      "/dashboard/properties",
      "/dashboard/clients",
      "/dashboard/analytics",
    ];

    const isAdminRoute = adminOnlyPaths.some((path) =>
      nextUrl.pathname.startsWith(path)
    );

    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/dashboard/leads", nextUrl));
    }
  }

  // Redirect /dashboard to appropriate page based on role
  if (nextUrl.pathname === "/dashboard") {
    if (userRole === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/properties", nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard/leads", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
