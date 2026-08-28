import { getWpBaseUrl } from "@/lib/wp/config";

/** Réécrit les liens WP membres/groupes vers les routes V2 quand c’est possible. */
export function rewriteCommunityHtml(html: string): string {
  const base = getWpBaseUrl().replace(/\/$/, "");

  return html
    .replace(
      new RegExp(`${base}/membres/([a-zA-Z0-9._-]+)/?`, "g"),
      "/membres/$1",
    )
    .replace(
      new RegExp(`${base}/groupes/([a-zA-Z0-9._-]+)/?`, "g"),
      "/groupes/$1",
    );
}
