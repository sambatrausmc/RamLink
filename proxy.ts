import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth-session-contract";
import { isProtectedWorkspacePath } from "@/lib/auth-navigation";

export function proxy(request: NextRequest) {
  if (
    !isProtectedWorkspacePath(request.nextUrl.pathname) ||
    request.cookies.has(SESSION_COOKIE_NAME)
  ) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/account/:path*",
    "/dashboard/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/report/:path*",
    "/saved/:path*",
    "/club/:path*",
    "/admin/:path*",
  ],
};
