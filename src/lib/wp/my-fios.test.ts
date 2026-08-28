import { describe, expect, it } from "vitest";
import { enrichMembershipsAsFios } from "./my-fios";
import type { WpFio, WpFioMembership } from "./community-types";

const membership: WpFioMembership = {
  id: 83,
  name: "AGAPAO",
  slug: "agapao",
  link: "https://myicconline.com/groupes/agapao/",
  status: "public",
  type: "fio",
  role_in_group: "member",
  is_admin: false,
  is_mod: false,
  date_modified: "",
};

const catalog: WpFio[] = [
  {
    id: 83,
    nom: "AGAPAO",
    description: "Une famille…",
    jour: "Monday",
    horaire: "21:00",
    pilote: "Jean",
    pilier: "",
    membres: 3,
    image: "https://myicconline.com/wp-content/uploads/buddypress/groups/83/cover-image/x.png",
    link: "https://myicconline.com/groupes/agapao/",
    date_creation: "",
    slug: "agapao",
    zoom_link: "https://zoom.us/j/123",
    types: ["fio"],
    category: "fio",
  },
];

describe("enrichMembershipsAsFios", () => {
  it("réutilise cover et métadonnées du catalogue", () => {
    const [fio] = enrichMembershipsAsFios([membership], catalog);
    expect(fio.image).toContain("cover-image");
    expect(fio.membres).toBe(3);
    expect(fio.zoom_link).toBe("https://zoom.us/j/123");
  });
});
