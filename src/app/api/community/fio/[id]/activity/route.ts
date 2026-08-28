import { NextResponse } from "next/server";
import { getFioActivities } from "@/lib/wp/community";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const fioId = Number(id);
  if (!Number.isFinite(fioId) || fioId <= 0 || fioId > 999_999) {
    return NextResponse.json(
      { ok: false, error: "Groupe invalide." },
      { status: 400 },
    );
  }

  const url = new URL(request.url);
  const page = Math.min(50, Math.max(1, Number(url.searchParams.get("page") || 1)));
  const perPage = Math.min(
    30,
    Math.max(1, Number(url.searchParams.get("per_page") || 15)),
  );

  try {
    const data = await getFioActivities(fioId, { page, perPage });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[community/fio/activity]", err);
    return NextResponse.json(
      { ok: false, error: "Impossible de charger le fil." },
      { status: 502 },
    );
  }
}
