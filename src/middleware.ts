import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, isValidSessionToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/login"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/api/auth");
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

export async function middleware(request: NextRequest) {
  const accessKey = process.env.APP_ACCESS_KEY;
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const isAuthenticated =
    Boolean(accessKey) && (await isValidSessionToken(accessKey!, token));

  if (pathname === "/login") {
    if (isAuthenticated) {
      const from = request.nextUrl.searchParams.get("from");
      const dest = from && from !== "/login" ? from : "/";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!accessKey) {
    if (isApiRoute(pathname)) {
      return NextResponse.json(
        { error: "APP_ACCESS_KEY nu este configurată pe server." },
        { status: 503 },
      );
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    loginUrl.searchParams.set("error", "missing-key");
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated) {
    return NextResponse.next();
  }

  if (isApiRoute(pathname)) {
    return NextResponse.json(
      { error: "Neautentificat. Reîncearcă login-ul." },
      { status: 401 },
    );
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
