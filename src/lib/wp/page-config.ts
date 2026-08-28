export const WP_PAGES_REVALIDATE = 300;
export const WP_PAGES_TAG = "wp-pages";

/** Clé i18n dans messages → wpPages.{messageKey} */
export type CmsPageMessageKey =
  | "nousRejoindre"
  | "aVotreEcoute"
  | "jaiBesoinDePrieres"
  | "magazine"
  | "submitArticle";

export type CmsPageConfig = {
  /** Segment d’URL Next.js (ex. /nous-rejoindre) */
  route: string;
  /** Slug WordPress REST */
  wpSlug: string;
  messageKey: CmsPageMessageKey;
};

export const CMS_PAGE_CONFIG: Record<string, CmsPageConfig> = {
  "nous-rejoindre": {
    route: "nous-rejoindre",
    wpSlug: "nous-rejoindre",
    messageKey: "nousRejoindre",
  },
  "a-votre-ecoute": {
    route: "a-votre-ecoute",
    wpSlug: "a-votre-ecoute",
    messageKey: "aVotreEcoute",
  },
  "jai-besoin-de-prieres": {
    route: "jai-besoin-de-prieres",
    wpSlug: "jai-besoin-de-prieres",
    messageKey: "jaiBesoinDePrieres",
  },
  magazine: {
    route: "magazine",
    wpSlug: "magazine",
    messageKey: "magazine",
  },
  "soumettre-un-article": {
    route: "soumettre-un-article",
    wpSlug: "blog-2",
    messageKey: "submitArticle",
  },
};

export const CMS_PAGE_ROUTES = Object.keys(CMS_PAGE_CONFIG);

/** Liens barre communauté (header) */
export const CMS_NAV_ITEMS = [
  { href: "/evenements", labelKey: "events" as const },
  { href: "/nous-rejoindre", labelKey: "joinUs" as const },
  { href: "/a-votre-ecoute", labelKey: "listen" as const },
  { href: "/jai-besoin-de-prieres", labelKey: "prayer" as const },
  { href: "/magazine", labelKey: "magazine" as const },
];

export function getCmsPageConfig(route: string): CmsPageConfig | undefined {
  return CMS_PAGE_CONFIG[route];
}

export function isCmsPageRoute(route: string): route is keyof typeof CMS_PAGE_CONFIG {
  return route in CMS_PAGE_CONFIG;
}
