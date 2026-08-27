import { cookies } from "next/headers";
import { AUTH_COOKIE, AUTH_COOKIE_MAX_AGE } from "@/lib/auth/types";
import { fetchWpMe, validateWpJwtToken } from "@/lib/auth/wp-auth";
import type { AuthUser } from "@/lib/auth/types";

export async function getAuthToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(AUTH_COOKIE)?.value || null;
}

export async function setAuthTokenCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
}

export async function clearAuthTokenCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(AUTH_COOKIE);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getAuthToken();
  if (!token) return null;

  const valid = await validateWpJwtToken(token);
  if (!valid) {
    await clearAuthTokenCookie();
    return null;
  }

  const user = await fetchWpMe(token);
  if (!user) {
    await clearAuthTokenCookie();
    return null;
  }

  return user;
}
