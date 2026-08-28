import { cookies } from "next/headers";
import {
  AUTH_COOKIE_MAX_AGE,
  SESSION_COOKIE,
  WP_TOKEN_COOKIE,
} from "@/lib/auth/types";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session-token";
import { fetchWpMe, validateWpJwtToken } from "@/lib/auth/wp-auth";
import type { AuthUser } from "@/lib/auth/types";

function cookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  };
}

export async function getAuthToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(WP_TOKEN_COOKIE)?.value || null;
}

export async function setAuthCookies(params: {
  wpToken: string;
  userId: number;
  slug: string;
}): Promise<void> {
  const jar = await cookies();
  const opts = cookieOptions();

  jar.set(WP_TOKEN_COOKIE, params.wpToken, opts);
  jar.set(
    SESSION_COOKIE,
    createSessionToken({ id: params.userId, slug: params.slug }),
    opts,
  );
}

export async function clearAuthTokenCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(WP_TOKEN_COOKIE);
  jar.delete(SESSION_COOKIE);
  // Ancien cookie éventuel
  jar.delete("icc_wp_token");
}

export async function hasValidSignedSession(): Promise<boolean> {
  const jar = await cookies();
  return Boolean(verifySessionToken(jar.get(SESSION_COOKIE)?.value));
}

/** Lit le JWT sans modifier les cookies — pour les pages publiques. */
export async function peekAuthToken(): Promise<string | null> {
  const jar = await cookies();
  const session = verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  const token = jar.get(WP_TOKEN_COOKIE)?.value;

  if (!session || !token) {
    return null;
  }

  const valid = await validateWpJwtToken(token);
  if (!valid) {
    return null;
  }

  const user = await fetchWpMe(token);
  if (!user || user.id !== session.sub) {
    return null;
  }

  return token;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const session = verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  const token = jar.get(WP_TOKEN_COOKIE)?.value;

  if (!session || !token) {
    if (token || jar.get(SESSION_COOKIE)?.value) {
      await clearAuthTokenCookie();
    }
    return null;
  }

  const valid = await validateWpJwtToken(token);
  if (!valid) {
    await clearAuthTokenCookie();
    return null;
  }

  const user = await fetchWpMe(token);
  if (!user || user.id !== session.sub) {
    await clearAuthTokenCookie();
    return null;
  }

  return user;
}
