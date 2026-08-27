import { getWpBaseUrl } from "@/lib/wp/config";
import type {
  AuthUser,
  WpJwtTokenResponse,
  WpMeResponse,
} from "@/lib/auth/types";

function stripHtml(input: string): string {
  return input.replace(/<[^>]+>/g, "").trim();
}

export async function requestWpJwtToken(
  username: string,
  password: string,
): Promise<{ ok: true; data: WpJwtTokenResponse } | { ok: false; message: string; status: number }> {
  const res = await fetch(`${getWpBaseUrl()}/wp-json/jwt-auth/v1/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as
    | WpJwtTokenResponse
    | { message?: string; code?: string }
    | null;

  if (!res.ok || !json || !("token" in json) || !json.token) {
    const raw =
      json && "message" in json && typeof json.message === "string"
        ? json.message
        : "Identifiants incorrects.";
    return { ok: false, message: stripHtml(raw), status: res.status || 401 };
  }

  return { ok: true, data: json };
}

export async function validateWpJwtToken(
  token: string,
): Promise<boolean> {
  const res = await fetch(
    `${getWpBaseUrl()}/wp-json/jwt-auth/v1/token/validate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );
  return res.ok;
}

export async function fetchWpMe(token: string): Promise<AuthUser | null> {
  const res = await fetch(`${getWpBaseUrl()}/wp-json/wp/v2/users/me?context=edit`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const me = (await res.json()) as WpMeResponse;
  return {
    id: me.id,
    email: me.email || "",
    name: me.name,
    slug: me.slug,
    avatarUrl: me.avatar_urls?.["96"] || me.avatar_urls?.["48"],
  };
}
