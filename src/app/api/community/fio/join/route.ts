import { NextResponse } from "next/server";
import {
  rejectBadOrigin,
  rejectRateLimit,
  requireAuth,
} from "@/lib/api/require-auth";
import { joinFio } from "@/lib/wp/community-auth";

export async function POST(request: Request) {
  const originError = rejectBadOrigin(request);
  if (originError) return originError;

  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const rateError = rejectRateLimit({
    request,
    userId: auth.user.id,
    key: "join-fio",
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (rateError) return rateError;

  let body: { fioId?: number };
  try {
    body = (await request.json()) as { fioId?: number };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Requête invalide." },
      { status: 400 },
    );
  }

  const fioId = Number(body.fioId);
  if (!Number.isFinite(fioId) || fioId <= 0) {
    return NextResponse.json(
      { ok: false, error: "Groupe invalide." },
      { status: 400 },
    );
  }

  try {
    const result = await joinFio(auth.token, fioId);
    if (!result.ok) {
      const status =
        result.status === 401 || result.status === 403
          ? 401
          : result.status >= 400 && result.status < 500
            ? result.status
            : 502;
      return NextResponse.json(
        { ok: false, error: result.message },
        { status },
      );
    }

    return NextResponse.json({
      ok: true,
      message: result.data.message,
      fioId: result.data.fio_id ?? fioId,
      membershipStatus: result.data.status ?? "member",
    });
  } catch (err) {
    console.error("[community/fio/join]", err);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur." },
      { status: 500 },
    );
  }
}
