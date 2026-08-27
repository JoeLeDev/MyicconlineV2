import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/types";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (pathname.startsWith("/espace") && !token) {
    const loginUrl = new URL("/connexion", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/connexion" && token) {
    return NextResponse.redirect(new URL("/espace", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/espace/:path*", "/connexion"],
};
