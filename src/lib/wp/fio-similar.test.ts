import { describe, expect, it } from "vitest";
import { getSimilarFios } from "./fio-similar";
import type { WpFio } from "./community-types";

function makeFio(id: number, nom: string, overrides: Partial<WpFio> = {}): WpFio {
  return {
    id,
    nom,
    description: "",
    jour: "Monday",
    horaire: "20:00",
    pilote: "",
    pilier: "Alice",
    membres: 1,
    image: "",
    link: "",
    date_creation: "",
    slug: `group-${id}`,
    zoom_link: "",
    types: ["fio"],
    category: "fio",
    ...overrides,
  };
}

describe("getSimilarFios", () => {
  it("priorise même pilier et catégorie", () => {
    const current = makeFio(1, "Courant", { pilier: "Alice" });
    const similar = getSimilarFios(current, [
      current,
      makeFio(2, "Proche", { pilier: "Alice" }),
      makeFio(3, "Lointain", {
        pilier: "Bob",
        jour: "Friday",
        types: ["on-est-ensemble"],
        category: "on-est-ensemble",
      }),
    ]);

    expect(similar.map((fio) => fio.id)).toEqual([2]);
  });
});
