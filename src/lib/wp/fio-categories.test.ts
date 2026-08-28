import { describe, expect, it } from "vitest";
import {
  getFioPrimaryCategory,
  getOrderedCategorySections,
  groupFiosByCategory,
} from "./fio-categories";
import type { WpFio } from "./community-types";

function makeFio(id: number, nom: string, types?: string[]): WpFio {
  return {
    id,
    nom,
    description: "",
    jour: "",
    horaire: "",
    pilote: "",
    pilier: "",
    membres: 1,
    image: "",
    link: "",
    date_creation: "",
    slug: `group-${id}`,
    zoom_link: "",
    types,
    category: getFioPrimaryCategory(types),
  };
}

describe("fio categories", () => {
  it("utilise le type BuddyPress principal", () => {
    expect(getFioPrimaryCategory(["on-est-ensemble"])).toBe("on-est-ensemble");
    expect(getFioPrimaryCategory(["pilotes-fio"])).toBe("pilotes-fio");
    expect(getFioPrimaryCategory(["fio"])).toBe("fio");
  });

  it("ordonne les sections par catégorie", () => {
    const grouped = groupFiosByCategory([
      makeFio(1, "B", ["on-est-ensemble"]),
      makeFio(2, "A", ["fio"]),
      makeFio(3, "C", ["pilotes-fio"]),
    ]);

    expect(getOrderedCategorySections(grouped).map((section) => section.category)).toEqual([
      "fio",
      "on-est-ensemble",
      "pilotes-fio",
    ]);
  });
});
