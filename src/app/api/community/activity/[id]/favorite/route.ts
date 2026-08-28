import { NextResponse } from "next/server";
import {
  rejectBadOrigin,
  rejectRateLimit,
  requireAuth,
} from "@/lib/api/require-auth";
import { toggleActivityFavorite } from "@/lib/wp/community-auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const originError = rejectBadOrigin(request);
  if (originError) return originError;

  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const rateError = rejectRateLimit({
    request,
    userId: auth.user.id,
    key: "activity-favorite",
    limit: 60,
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

  try {
    const result = await toggleActivityFavorite(auth.token, activityId);
    if (!result.ok) {
      const status = result.status === 401 || result.status === 403 ? 401 : 502;
      return NextResponse.json(
        { ok: false, error: result.message },
        { status },
      );
    }

    return NextResponse.json({
      ok: true,
      favorited: result.data.favorited,
      favoriteCount: result.data.favorite_count,
    });
  } catch (err) {
    console.error("[community/activity/favorite]", err);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur." },
      { status: 500 },
    );
  }
}
