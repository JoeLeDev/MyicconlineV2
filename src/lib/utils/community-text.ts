import { formatPostContent } from "@/lib/wp/article-submit";
import { decodeHtmlEntities } from "./html";

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

/** Convertit une description communauté en HTML sûr (paragraphes + retours à la ligne). */
export function formatCommunityText(raw: string): string {
  const text = normalizeCommunityPlainText(raw);
  if (!text) return "";
  return formatPostContent(text);
}

/** Extrait une ligne pour les aperçus (cartes, meta description). */
export function communityTextExcerpt(raw: string, maxLength = 160): string {
  const plain = normalizeCommunityPlainText(raw).replace(/\n+/g, " ").replace(/\s+/g, " ");
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength - 1).trim()}…`;
}
