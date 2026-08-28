import { NextResponse } from "next/server";
import {
  rejectBadOrigin,
  rejectRateLimit,
  requireAuth,
} from "@/lib/api/require-auth";
import { postGroupActivity } from "@/lib/wp/community-auth";

const MIN_POST = 1;
const MAX_POST = 5000;

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const originError = rejectBadOrigin(request);
  if (originError) return originError;

  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const rateError = rejectRateLimit({
    request,
    userId: auth.user.id,
    key: "fio-post",
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (rateError) return rateError;

  const { id } = await params;
  const fioId = Number(id);
  if (!Number.isFinite(fioId) || fioId <= 0) {
    return NextResponse.json(
      { ok: false, error: "Groupe invalide." },
      { status: 400 },
    );
  }

  let body: { content?: string };
  try {
    body = (await request.json()) as { content?: string };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Requête invalide." },
      { status: 400 },
    );
  }

  const content = String(body.content || "").trim();
  if (content.length < MIN_POST || content.length > MAX_POST) {
    return NextResponse.json(
      { ok: false, error: "Publication invalide." },
      { status: 400 },
    );
  }

  try {
    const result = await postGroupActivity(auth.token, fioId, content);
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
      activity: {
        id: result.data.id,
        userId: result.data.user_id,
        userName: result.data.user_name,
        content: result.data.content.rendered,
        date: result.data.date,
      },
    });
  } catch (err) {
    console.error("[community/fio/post]", err);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur." },
      { status: 500 },
    );
  }
}
