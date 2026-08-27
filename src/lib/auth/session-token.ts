import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import type { SessionPayload } from "@/lib/auth/types";
import { AUTH_COOKIE_MAX_AGE } from "@/lib/auth/types";

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET manquant ou trop court (min. 32 caractères). Ajoutez-le dans .env.local / Vercel.",
    );
  }
  return secret;
}

function b64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(input: string): Buffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, "base64");
}

function sign(data: string, secret: string): string {
  return b64url(createHmac("sha256", secret).update(data).digest());
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function createSessionToken(user: {
  id: number;
  slug: string;
}): string {
  const secret = getAuthSecret();
  const payload: SessionPayload = {
    sub: user.id,
    slug: user.slug,
    exp: Math.floor(Date.now() / 1000) + AUTH_COOKIE_MAX_AGE,
  };
  const body = b64url(JSON.stringify(payload));
  const sig = sign(body, secret);
  return `${body}.${sig}`;
}

export function verifySessionToken(
  token: string | undefined | null,
): SessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [body, sig] = parts;
  let secret: string;
  try {
    secret = getAuthSecret();
  } catch {
    return null;
  }

  const expected = sign(body, secret);
  if (!safeEqual(sig, expected)) return null;

  try {
    const payload = JSON.parse(fromB64url(body).toString("utf8")) as SessionPayload;
    if (
      typeof payload.sub !== "number" ||
      typeof payload.exp !== "number" ||
      typeof payload.slug !== "string"
    ) {
      return null;
    }
    if (payload.exp * 1000 <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Génère un secret aléatoire (doc / setup) */
export function generateAuthSecret(): string {
  return randomBytes(48).toString("base64url");
}

/**
 * Redirection interne sûre uniquement (anti open-redirect).
 */
export function safeInternalPath(
  path: string | null | undefined,
  fallback = "/espace",
): string {
  if (!path) return fallback;
  if (!path.startsWith("/")) return fallback;
  if (path.startsWith("//") || path.startsWith("/\\")) return fallback;
  if (path.includes("://") || path.includes("\\")) return fallback;
  if (path.includes("@")) return fallback;
  return path;
}
