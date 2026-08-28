import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { WpFioMembership } from "./community-types";
import { joinFio, normalizeFioMembershipList } from "./community-auth";

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

describe("normalizeFioMembershipList", () => {
  it("accepte un tableau direct", () => {
    expect(normalizeFioMembershipList([sampleFio])).toEqual([sampleFio]);
  });

  it("déplie { fios: [...] }", () => {
    expect(normalizeFioMembershipList({ fios: [sampleFio] })).toEqual([sampleFio]);
  });

  it("déplie { groups: [...] }", () => {
    expect(normalizeFioMembershipList({ groups: [sampleFio] })).toEqual([sampleFio]);
  });

  it("ignore les entrées invalides", () => {
    expect(
      normalizeFioMembershipList([sampleFio, { id: 1 }, null, "x"]),
    ).toEqual([sampleFio]);
  });

  it("renvoie [] pour null, objet vide ou forme inconnue", () => {
    expect(normalizeFioMembershipList(null)).toEqual([]);
    expect(normalizeFioMembershipList({})).toEqual([]);
    expect(normalizeFioMembershipList({ meta: [] })).toEqual([]);
  });

  it("permet .map() sans lever d'exception sur une réponse enveloppée", () => {
    const fios = normalizeFioMembershipList({ fios: [sampleFio] }).map(
      (fio) => fio.slug,
    );
    expect(fios).toEqual(["test-dev"]);
  });
});

describe("joinFio", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ id: 999 }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejoint une FIO publique via BuddyPress", async () => {
    const result = await joinFio("jwt-token", 84);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toMatchObject({ fio_id: 84, status: "member" });
    }

    expect(fetch).toHaveBeenCalledWith(
      "https://myicconline.com/wp-json/buddypress/v1/groups/84/members",
      expect.objectContaining({
        method: "POST",
        headers: expect.any(Headers),
      }),
    );

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(init.body).toBe(JSON.stringify({ context: "view" }));
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer jwt-token");
  });

  it("traite déjà membre comme un succès", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        code: "bp_rest_group_member_already_exists",
        message: "Already a member",
      }),
    } as Response);

    const result = await joinFio("jwt-token", 84);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.status).toBe("member");
    }
  });

  it("crée une demande d'adhésion pour une FIO privée", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          code: "bp_rest_group_private",
          message: "Groupe privé",
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 12, message: "Demande envoyée" }),
      } as Response);

    const result = await joinFio("jwt-token", 42);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.status).toBe("pending");
      expect(result.data.fio_id).toBe(42);
    }

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenLastCalledWith(
      "https://myicconline.com/wp-json/buddypress/v1/groups/membership-requests",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("propage l'erreur BuddyPress quand l'adhésion échoue", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ code: "server_error", message: "Erreur serveur" }),
    } as Response);

    const result = await joinFio("jwt-token", 84);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(500);
      expect(result.message).toBe("Erreur serveur");
    }
  });
});
