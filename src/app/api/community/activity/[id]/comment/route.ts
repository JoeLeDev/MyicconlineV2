import { NextResponse } from "next/server";
import {
  rejectBadOrigin,
  rejectRateLimit,
  requireAuth,
} from "@/lib/api/require-auth";
import { postActivityComment } from "@/lib/wp/community-auth";

const MIN_COMMENT = 1;
const MAX_COMMENT = 5000;

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const originError = rejectBadOrigin(request);
  if (originError) return originError;

  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const rateError = rejectRateLimit({
    request,
    userId: auth.user.id,
    key: "activity-comment",
    limit: 30,
    windowMs: 15 * 60 * 1000,
  });
  if (rateError) return rateError;

  const { id } = await params;
  const activityId = Number(id);
  if (!Number.isFinite(activityId) || activityId <= 0) {
    return NextResponse.json(
      { ok: false, error: "Activité invalide." },
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
  if (content.length < MIN_COMMENT || content.length > MAX_COMMENT) {
    return NextResponse.json(
      { ok: false, error: "Commentaire invalide." },
      { status: 400 },
    );
  }

  try {
    const result = await postActivityComment(auth.token, activityId, content);
    if (!result.ok) {
      const status = result.status === 401 || result.status === 403 ? 401 : 502;
      return NextResponse.json(
        { ok: false, error: result.message },
        { status },
      );
    }

    return NextResponse.json({
      ok: true,
      comment: {
        id: result.data.id,
        userId: result.data.user_id,
        content: result.data.content.rendered,
        date: result.data.date,
        userName: result.data.user_name,
        userAvatar: result.data.user_avatar.thumb,
      },
    });
  } catch (err) {
    console.error("[community/activity/comment]", err);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur." },
      { status: 500 },
    );
  }
}
