import { describe, expect, it } from "vitest";
import {
  normalizeCommunityPlainText,
  normalizeWpFioText,
} from "./community-text";
import type { WpFio } from "@/lib/wp/community-types";

describe("normalizeCommunityPlainText", () => {
  it("retire les antislashs WordPress devant une apostrophe", () => {
    expect(normalizeCommunityPlainText("Jardin d\\'eden")).toBe("Jardin d'eden");
  });
});

describe("normalizeWpFioText", () => {
  it("normalise le nom et les autres champs texte", () => {
    const fio: Pick<
      WpFio,
      "nom" | "description" | "pilote" | "pilier" | "jour" | "horaire" | "ville"
    > = {
      nom: "Jardin d\\'eden",
      description: "l\\'amour de Dieu",
      pilote: "Jean d\\'Or",
      pilier: "",
      jour: "Monday",
      horaire: "17:00",
      ville: "",
    };

    expect(normalizeWpFioText(fio).nom).toBe("Jardin d'eden");
    expect(normalizeWpFioText(fio).description).toBe("l'amour de Dieu");
    expect(normalizeWpFioText(fio).pilote).toBe("Jean d'Or");
  });
});
