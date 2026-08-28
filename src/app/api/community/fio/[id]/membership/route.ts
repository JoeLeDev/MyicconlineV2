import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { getFioMembershipStatus } from "@/lib/wp/community-auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const fioId = Number(id);
  if (!Number.isFinite(fioId) || fioId <= 0) {
    return NextResponse.json(
      { ok: false, error: "Groupe invalide." },
      { status: 400 },
    );
  }

  try {
    const result = await getFioMembershipStatus(auth.token, fioId, auth.user.id);
    if (!result.ok) {
      const status = result.status === 401 || result.status === 403 ? 401 : 502;
      return NextResponse.json(
        { ok: false, error: result.message },
        { status },
      );
    }

    return NextResponse.json({
      ok: true,
      isMember: result.data.isMember,
      isPending: result.data.isPending,
    });
  } catch (err) {
    console.error("[community/fio/membership]", err);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur." },
      { status: 500 },
    );
  }
}
