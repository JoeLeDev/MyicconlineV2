import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { getMyFios } from "@/lib/wp/community-auth";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const result = await getMyFios(auth.token);
    if (!result.ok) {
      const status = result.status === 401 || result.status === 403 ? 401 : 502;
      return NextResponse.json(
        { ok: false, error: result.message },
        { status },
      );
    }

    return NextResponse.json({
      ok: true,
      fios: (Array.isArray(result.data) ? result.data : []).map((fio) => ({
        id: fio.id,
        name: fio.name,
        slug: fio.slug,
      })),
    });
  } catch (err) {
    console.error("[community/me/fios]", err);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur." },
      { status: 500 },
    );
  }
}
