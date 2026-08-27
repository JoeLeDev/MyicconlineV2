import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, WP_TOKEN_COOKIE } from "@/lib/auth/types";
import { safeInternalPath, verifySessionToken } from "@/lib/auth/session-token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  const hasWpToken = Boolean(request.cookies.get(WP_TOKEN_COOKIE)?.value);
  const authenticated = Boolean(session && hasWpToken);

  if (pathname.startsWith("/espace") && !authenticated) {
    const loginUrl = new URL("/connexion", request.url);
    loginUrl.searchParams.set(
      "next",
      safeInternalPath(pathname + request.nextUrl.search, "/espace"),
    );
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/connexion" && authenticated) {
    return NextResponse.redirect(new URL("/espace", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/espace/:path*", "/connexion"],
};
