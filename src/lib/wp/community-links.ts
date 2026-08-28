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
};

function wpPath(path: string): string {
  const base = getWpBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** Liens vers les sections communautaires WordPress (BuddyPress, USP, etc.). */
export const WP_COMMUNITY_LINKS: CommunityLink[] = [
  { id: "publications", href: wpPath("/blog/") },
  { id: "submitArticle", href: wpPath("/blog-2/") },
  { id: "events", href: wpPath("/evenements-6/") },
  { id: "activity", href: wpPath("/activites-du-site/") },
  { id: "members", href: wpPath("/membres/") },
  { id: "groups", href: wpPath("/groupes/") },
  { id: "community", href: getWpLoginUrl().replace(/\/?$/, "/") },
];

export function getWpMemberProfileUrl(slug: string): string {
  return wpPath(`/membres/${slug}/`);
}

export type V2ShortcutId = "blog" | "home";

export const V2_SHORTCUTS: { id: V2ShortcutId; href: string }[] = [
  { id: "blog", href: "/blog" },
  { id: "home", href: "/" },
];
