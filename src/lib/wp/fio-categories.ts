import type { WpFio } from "./community-types";

export const FIO_CATEGORY_ORDER = [
  "fio",
  "on-est-ensemble",
  "pilotes-fio",
] as const;

export type FioCategorySlug = (typeof FIO_CATEGORY_ORDER)[number] | "other";

export function getFioPrimaryCategory(types?: string[]): FioCategorySlug {
  if (!types?.length) return "fio";

  for (const type of types) {
    if (FIO_CATEGORY_ORDER.includes(type as (typeof FIO_CATEGORY_ORDER)[number])) {
      return type as FioCategorySlug;
    }
  }

  return "other";
}

export function groupFiosByCategory(
  fios: WpFio[],
): Map<FioCategorySlug, WpFio[]> {
  const grouped = new Map<FioCategorySlug, WpFio[]>();

  for (const fio of fios) {
    const category = (fio.category ??
      getFioPrimaryCategory(fio.types)) as FioCategorySlug;
    const list = grouped.get(category) ?? [];
    list.push(fio);
    grouped.set(category, list);
  }

  for (const list of grouped.values()) {
    list.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  }

  return grouped;
}

export function getOrderedCategorySections(
  grouped: Map<FioCategorySlug, WpFio[]>,
): { category: FioCategorySlug; fios: WpFio[] }[] {
  const sections: { category: FioCategorySlug; fios: WpFio[] }[] = [];

  for (const category of FIO_CATEGORY_ORDER) {
    const fios = grouped.get(category);
    if (fios?.length) {
      sections.push({ category, fios });
    }
  }

  const other = grouped.get("other");
  if (other?.length) {
    sections.push({ category: "other", fios: other });
  }

  return sections;
}

export function getCategoryAccentClass(category: FioCategorySlug): string {
  switch (category) {
    case "on-est-ensemble":
      return "bg-violet-100 text-violet-900";
    case "pilotes-fio":
      return "bg-amber-100 text-amber-950";
    case "other":
      return "bg-stone-100 text-stone-800";
    default:
      return "bg-sky-100 text-sky-950";
  }
}
