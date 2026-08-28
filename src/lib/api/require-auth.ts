import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/origin";
import { getClientIp, consumeRateLimit } from "@/lib/auth/rate-limit";
import { getAuthToken, getCurrentUser } from "@/lib/auth/session";
import type { AuthUser } from "@/lib/auth/types";

type AuthContext = {
  user: AuthUser;
  token: string;
};

export async function requireAuth(): Promise<AuthContext | NextResponse> {
  const user = await getCurrentUser();
  const token = await getAuthToken();

  if (!user || !token) {
    return NextResponse.json(
      { ok: false, error: "Connexion requise." },
      { status: 401 },
    );
  }

  return { user, token };
}

export function rejectBadOrigin(request: Request): NextResponse | null {
  if (!assertSameOrigin(request)) {
    return NextResponse.json(
      { ok: false, error: "Origine non autorisée." },
      { status: 403 },
    );
  }
  return null;
}

export function rejectRateLimit(params: {
  request: Request;
  userId: number;
  key: string;
  limit: number;
  windowMs: number;
}): NextResponse | null {
  const ip = getClientIp(params.request);
  const limited = consumeRateLimit({
    key: `${params.key}:${params.userId}:${ip}`,
    limit: params.limit,
    windowMs: params.windowMs,
  });

  if (!limited.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Trop de requêtes. Réessayez dans ${limited.retryAfterSec}s.`,
      },
      { status: 429 },
    );
  }

  return null;
}
