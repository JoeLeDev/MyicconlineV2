import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/origin";
import { consumeRateLimit, getClientIp } from "@/lib/auth/rate-limit";
import { clearAuthTokenCookie, setAuthCookies } from "@/lib/auth/session";
import { fetchWpMe, requestWpJwtToken } from "@/lib/auth/wp-auth";

const GENERIC_LOGIN_ERROR =
  "Identifiant ou mot de passe incorrect.";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json(
      { ok: false, error: "Origine non autorisée." },
      { status: 403 },
    );
  }

  const ip = getClientIp(request);
  const limited = consumeRateLimit({
    key: `login:${ip}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!limited.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Trop de tentatives. Réessayez dans ${limited.retryAfterSec}s.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Requête invalide." },
      { status: 400 },
    );
  }

  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (!username || !password || username.length > 190 || password.length > 200) {
    return NextResponse.json(
      { ok: false, error: GENERIC_LOGIN_ERROR },
      { status: 401 },
    );
  }

  try {
    const result = await requestWpJwtToken(username, password);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: GENERIC_LOGIN_ERROR },
        { status: 401 },
      );
    }

    const me = await fetchWpMe(result.data.token);
    if (!me) {
      return NextResponse.json(
        { ok: false, error: "Session impossible à créer." },
        { status: 502 },
      );
    }

    await setAuthCookies({
      wpToken: result.data.token,
      userId: me.id,
      slug: me.slug,
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: me.id,
        email: me.email,
        name: me.name,
        slug: me.slug,
        avatarUrl: me.avatarUrl,
      },
    });
  } catch (err) {
    console.error("[auth/login]", err);
    const message =
      err instanceof Error && err.message.includes("AUTH_SECRET")
        ? "Configuration serveur incomplète (AUTH_SECRET)."
        : "Connexion temporairement indisponible.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE() {
  await clearAuthTokenCookie();
  return NextResponse.json({ ok: true });
}
