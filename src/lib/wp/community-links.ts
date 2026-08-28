import { getWpBaseUrl, getWpLoginUrl } from "@/lib/wp/config";

export type CommunityLinkId =
  | "publications"
  | "submitArticle"
  | "events"
  | "activity"
  | "members"
  | "groups"
  | "community";

export type CommunityLink = {
  id: CommunityLinkId;
  href: string;
  external?: boolean;
};

function wpPath(path: string): string {
  const base = getWpBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** Liens vers les sections communautaires WordPress (BuddyPress, USP, etc.). */
export const WP_COMMUNITY_LINKS: CommunityLink[] = [
  { id: "publications", href: "/blog", external: false },
  { id: "submitArticle", href: "/soumettre-un-article", external: false },
  { id: "events", href: "/evenements", external: false },
  { id: "activity", href: "/activites", external: false },
  { id: "members", href: "/membres", external: false },
  { id: "groups", href: "/groupes", external: false },
  { id: "community", href: getWpLoginUrl().replace(/\/?$/, "/") },
];

export function getMemberProfilePath(slug: string): `/membres/${string}` {
  return `/membres/${slug}`;
}

/** @deprecated Utiliser getMemberProfilePath pour le profil V2 */
export function getWpMemberProfileUrl(slug: string): string {
  return wpPath(`/membres/${slug}/`);
}

export type V2ShortcutId = "blog" | "home" | "myFios";

export const V2_SHORTCUTS: { id: V2ShortcutId; href: string }[] = [
  { id: "myFios", href: "/espace/mes-fios" },
  { id: "blog", href: "/blog" },
  { id: "home", href: "/" },
];
