import { NextResponse } from "next/server";
import {
  clearAuthTokenCookie,
  setAuthTokenCookie,
} from "@/lib/auth/session";
import { requestWpJwtToken } from "@/lib/auth/wp-auth";

export async function POST(request: Request) {
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

  if (!username || !password) {
    return NextResponse.json(
      { ok: false, error: "Identifiant et mot de passe requis." },
      { status: 400 },
    );
  }

  const result = await requestWpJwtToken(username, password);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.message },
      { status: result.status === 403 ? 401 : result.status },
    );
  }

  await setAuthTokenCookie(result.data.token);

  return NextResponse.json({
    ok: true,
    user: {
      email: result.data.user_email,
      name: result.data.user_display_name,
      slug: result.data.user_nicename,
    },
  });
}

export async function DELETE() {
  await clearAuthTokenCookie();
  return NextResponse.json({ ok: true });
}
