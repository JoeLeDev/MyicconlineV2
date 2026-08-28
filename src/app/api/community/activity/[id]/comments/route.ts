import { NextResponse } from "next/server";
import { getActivityComments } from "@/lib/wp/community-auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const activityId = Number(id);
  if (!Number.isFinite(activityId) || activityId <= 0) {
    return NextResponse.json(
      { ok: false, error: "Activité invalide." },
      { status: 400 },
    );
  }

  try {
    const comments = await getActivityComments(activityId);
    return NextResponse.json({
      ok: true,
      comments: comments.map((comment) => ({
        id: comment.id,
        userId: comment.user_id,
        content: comment.content.rendered,
        date: comment.date,
        userName: comment.user_name,
        userAvatar: comment.user_avatar.thumb,
      })),
    });
  } catch (err) {
    console.error("[community/activity/comments]", err);
    return NextResponse.json(
      { ok: false, error: "Impossible de charger les commentaires." },
      { status: 502 },
    );
  }
}
