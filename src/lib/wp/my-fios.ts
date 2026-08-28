import { getFioPrimaryCategory } from "./fio-categories";
import type { WpFio, WpFioMembership } from "./community-types";

function normalizeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug).trim().toLowerCase();
  } catch {
    return slug.trim().toLowerCase();
  }
}

function membershipToWpFio(membership: WpFioMembership): WpFio {
  const types = membership.type ? [membership.type] : ["fio"];
  return {
    id: membership.id,
    nom: membership.name,
    description: "",
    jour: "",
    horaire: "",
    pilote: "",
    pilier: "",
    membres: 0,
    image: "",
    link: membership.link,
    date_creation: membership.date_modified,
    slug: membership.slug,
    zoom_link: "",
    types,
    category: getFioPrimaryCategory(types),
    status: membership.status,
  };
}

/** Fusionne les adhésions utilisateur avec le catalogue FIO (images, horaires, etc.). */
export function enrichMembershipsAsFios(
  memberships: WpFioMembership[],
  catalog: WpFio[],
): WpFio[] {
  const byId = new Map(catalog.map((fio) => [fio.id, fio]));
  const bySlug = new Map(catalog.map((fio) => [normalizeSlug(fio.slug), fio]));

  return memberships.map((membership) => {
    const fromCatalog =
      byId.get(membership.id) ??
      bySlug.get(normalizeSlug(membership.slug));

    if (!fromCatalog) {
      return membershipToWpFio(membership);
    }

    return {
      ...fromCatalog,
      nom: fromCatalog.nom || membership.name,
      slug: fromCatalog.slug || membership.slug,
      link: fromCatalog.link || membership.link,
    };
  });
}
