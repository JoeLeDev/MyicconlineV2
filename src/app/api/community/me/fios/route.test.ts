import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WpFioMembership } from "@/lib/wp/community-types";

vi.mock("@/lib/api/require-auth", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/wp/community-auth", () => ({
  getMyFios: vi.fn(),
}));

import { requireAuth } from "@/lib/api/require-auth";
import { getMyFios } from "@/lib/wp/community-auth";
import { GET } from "./route";

const sampleFio: WpFioMembership = {
  id: 84,
  name: "Test dev",
  slug: "test-dev",
  link: "https://myicconline.com/groupes/test-dev/",
  status: "public",
  type: "fio",
  role_in_group: "member",
  is_admin: false,
  is_mod: false,
  date_modified: "2026-08-27T18:55:10",
};

describe("GET /api/community/me/fios", () => {
  beforeEach(() => {
    vi.mocked(requireAuth).mockResolvedValue({
      user: { id: 1, email: "a@b.c", name: "Test", slug: "test" },
      token: "jwt-token",
    });
  });

  it("renvoie 401 si non authentifié", async () => {
    vi.mocked(requireAuth).mockResolvedValue(
      NextResponse.json({ ok: false, error: "Connexion requise." }, { status: 401 }),
    );

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("renvoie la liste normalisée des FIO", async () => {
    vi.mocked(getMyFios).mockResolvedValue({
      ok: true,
      data: [sampleFio],
      status: 200,
    });

    const res = await GET();
    const json = (await res.json()) as {
      ok: boolean;
      fios: { id: number; name: string; slug: string }[];
    };

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.fios).toEqual([
      { id: 84, name: "Test dev", slug: "test-dev" },
    ]);
  });

  it("ne plante pas si data n'est pas un tableau (garde-fou route)", async () => {
    vi.mocked(getMyFios).mockResolvedValue({
      ok: true,
      data: null as unknown as WpFioMembership[],
      status: 200,
    });

    const res = await GET();
    const json = (await res.json()) as { ok: boolean; fios: unknown[] };

    expect(res.status).toBe(200);
    expect(json.fios).toEqual([]);
  });

  it("renvoie 502 quand WordPress échoue", async () => {
    vi.mocked(getMyFios).mockResolvedValue({
      ok: false,
      message: "Erreur WordPress.",
      status: 500,
    });

    const res = await GET();
    const json = (await res.json()) as { ok: boolean; error: string };

    expect(res.status).toBe(502);
    expect(json.ok).toBe(false);
    expect(json.error).toBe("Erreur WordPress.");
  });

  it("renvoie 401 quand WordPress renvoie 403", async () => {
    vi.mocked(getMyFios).mockResolvedValue({
      ok: false,
      message: "Forbidden",
      status: 403,
    });

    const res = await GET();
    expect(res.status).toBe(401);
  });
});
