import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { WpFioMembership } from "./community-types";
import {
  getFioMembershipStatus,
  joinFio,
  normalizeFioMembershipList,
  postGroupActivity,
} from "./community-auth";

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

  it("accepte id + nom sans slug", () => {
    const result = normalizeFioMembershipList([
      { id: 12, nom: "Les restaurés", fio_slug: "les-restores" },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(12);
    expect(result[0]?.name).toBe("Les restaurés");
    expect(result[0]?.slug).toBe("les-restores");
  });

  it("permet .map() sans lever d'exception sur une réponse enveloppée", () => {
    const fios = normalizeFioMembershipList({ fios: [sampleFio] }).map(
      (fio) => fio.slug,
    );
    expect(fios).toEqual(["test-dev"]);
  });
});

describe("getFioMembershipStatus", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("détecte un membre via /buddypress/v1/groups/me", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [
          { id: 55, name: "Les restaurés", slug: "les-restores", link: "" },
        ],
      }),
    );

    const result = await getFioMembershipStatus("jwt-token", 55, 999);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.isMember).toBe(true);
      expect(result.data.isPending).toBe(false);
    }
  });

  it("détecte une demande en attente", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => [],
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => [],
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => [{ group_id: 78 }],
        }),
    );

    const result = await getFioMembershipStatus("jwt-token", 78, 999);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.isMember).toBe(false);
      expect(result.data.isPending).toBe(true);
    }
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

describe("postGroupActivity", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          id: 700,
          user_id: 1,
          component: "groups",
          type: "activity_update",
          title: '<a href="#">Test User</a> posted an update',
          content: { rendered: "<p>Hello group</p>" },
          date: "2026-08-28T12:00:00",
          link: "https://myicconline.com/activity/700/",
          primary_item_id: 84,
          favorited: false,
          user_avatar: { thumb: "t.jpg", full: "f.jpg" },
        }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("publie une mise à jour dans le groupe via BuddyPress", async () => {
    const result = await postGroupActivity("jwt-token", 84, "Hello group");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.id).toBe(700);
      expect(result.data.content.rendered).toContain("Hello group");
    }

    expect(fetch).toHaveBeenCalledWith(
      "https://myicconline.com/wp-json/buddypress/v1/activity",
      expect.objectContaining({ method: "POST" }),
    );

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      content: "Hello group",
      component: "groups",
      type: "activity_update",
      primary_item_id: 84,
    });
  });
});
