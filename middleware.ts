import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = new Set(["/login", "/signup", "/"]);

const AUTH_ROUTES = new Set(["/login", "/signup"]);
const AUTH_API_PREFIX = "/api/auth";

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/assets") ||
    /\.[\w]+$/.test(pathname)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname) || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  if (pathname.startsWith(AUTH_API_PREFIX)) {
    return NextResponse.next();
  }

  // Check for Firebase token in cookies
  const firebaseToken = request.cookies.get("token")?.value ?? null;
  const isAuthenticated = Boolean(firebaseToken);

  // For API routes, require authentication
  if (pathname.startsWith("/api") && !pathname.startsWith(AUTH_API_PREFIX)) {
    if (!isAuthenticated) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_ROUTES.has(pathname);
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  // Redirect unauthenticated users to login (except for public routes)
  if (!isAuthenticated && !isPublicRoute && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);

    if (pathname !== "/") {
      loginUrl.searchParams.set("redirectTo", pathname);
    }

    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login/signup pages
  if (isAuthenticated && isPublicRoute && pathname !== "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest).*)",
  ],
};
