import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { SESSION_COOKIE, WP_TOKEN_COOKIE } from "@/lib/auth/types";
import { safeInternalPath, verifySessionToken } from "@/lib/auth/session-token";

const handleI18n = createMiddleware(routing);

function splitLocalePath(pathname: string): { locale: string; path: string } {
  const parts = pathname.split("/").filter(Boolean);
  const maybeLocale = parts[0];
  if (
    maybeLocale &&
    (routing.locales as readonly string[]).includes(maybeLocale)
  ) {
    const rest = parts.slice(1).join("/");
    return {
      locale: maybeLocale,
      path: rest ? `/${rest}` : "/",
    };
  }
  return { locale: routing.defaultLocale, path: pathname || "/" };
}

function localizedPath(locale: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === routing.defaultLocale) return normalized;
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

export function proxy(request: NextRequest) {
  const { locale, path } = splitLocalePath(request.nextUrl.pathname);
  const session = verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  const hasWpToken = Boolean(request.cookies.get(WP_TOKEN_COOKIE)?.value);
  const authenticated = Boolean(session && hasWpToken);

  if (path.startsWith("/espace") && !authenticated) {
    const loginUrl = new URL(
      localizedPath(locale, "/connexion"),
      request.url,
    );
    loginUrl.searchParams.set(
      "next",
      safeInternalPath(path + request.nextUrl.search, "/espace"),
    );
    return NextResponse.redirect(loginUrl);
  }

  if (path === "/connexion" && authenticated) {
    return NextResponse.redirect(
      new URL(localizedPath(locale, "/espace"), request.url),
    );
  }

  return handleI18n(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
