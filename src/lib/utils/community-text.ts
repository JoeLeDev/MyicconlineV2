import { decodeHtmlEntities } from "./html";
import type { WpFio } from "@/lib/wp/community-types";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function plainTextToHtml(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  return trimmed
    .split(/\n{2,}/)
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`,
    )
    .join("");
}

/** Nettoie le texte brut renvoyé par myicconline/v1 (échappements, sauts de ligne). */
export function normalizeCommunityPlainText(raw: string): string {
  let text = raw.trim();
  if (!text) return "";

  text = decodeHtmlEntities(text);
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  text = text.replace(/\\(['"\\])/g, "$1");
  text = text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");

  return text.trim();
}

/** Normalise les champs texte d'une FIO (échappements WP type d\\'eden). */
export function normalizeWpFioText<T extends Pick<
  WpFio,
  "nom" | "description" | "pilote" | "pilier" | "jour" | "horaire" | "ville"
>>(fio: T): T {
  return {
    ...fio,
    nom: normalizeCommunityPlainText(fio.nom),
    description: normalizeCommunityPlainText(fio.description),
    pilote: normalizeCommunityPlainText(fio.pilote),
    pilier: normalizeCommunityPlainText(fio.pilier),
    jour: normalizeCommunityPlainText(fio.jour),
    horaire: normalizeCommunityPlainText(fio.horaire),
    ville: fio.ville ? normalizeCommunityPlainText(fio.ville) : fio.ville,
  };
}

/** Convertit une description communauté en HTML sûr (paragraphes + retours à la ligne). */
export function formatCommunityText(raw: string): string {
  const text = normalizeCommunityPlainText(raw);
  if (!text) return "";
  return plainTextToHtml(text);
}

/** Extrait une ligne pour les aperçus (cartes, meta description). */
export function communityTextExcerpt(raw: string, maxLength = 160): string {
  const plain = normalizeCommunityPlainText(raw).replace(/\n+/g, " ").replace(/\s+/g, " ");
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength - 1).trim()}…`;
}
