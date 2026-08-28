export type SiteNavLink = {
  href: "/groupes" | "/membres" | "/activites" | "/espace/mes-fios" | "/blog" | "/magazine" | "/evenements" | "/nous-rejoindre" | "/a-votre-ecoute" | "/jai-besoin-de-prieres";
  labelKey:
    | "groups"
    | "members"
    | "activities"
    | "myFios"
    | "blog"
    | "magazine"
    | "events"
    | "joinUs"
    | "listen"
    | "prayer";
  descriptionKey:
    | "groupsDesc"
    | "membersDesc"
    | "activitiesDesc"
    | "myFiosDesc"
    | "blogDesc"
    | "magazineDesc"
    | "eventsDesc"
    | "joinUsDesc"
    | "listenDesc"
    | "prayerDesc";
  requiresAuth?: boolean;
};

export type SiteNavMegaMenu = {
  id: "community" | "resources" | "support";
  labelKey: "megaCommunity" | "megaResources" | "megaSupport";
  links: SiteNavLink[];
};

export type SiteNavSimpleLink = {
  href: "/" | "/a-propos" | "/contact";
  labelKey: "home" | "about" | "contact";
};

export const SITE_NAV_SIMPLE_LINKS: SiteNavSimpleLink[] = [
  { href: "/", labelKey: "home" },
  { href: "/a-propos", labelKey: "about" },
  { href: "/contact", labelKey: "contact" },
];

export const SITE_NAV_MEGA_MENUS: SiteNavMegaMenu[] = [
  {
    id: "community",
    labelKey: "megaCommunity",
    links: [
      {
        href: "/groupes",
        labelKey: "groups",
        descriptionKey: "groupsDesc",
      },
      {
        href: "/membres",
        labelKey: "members",
        descriptionKey: "membersDesc",
      },
      {
        href: "/activites",
        labelKey: "activities",
        descriptionKey: "activitiesDesc",
      },
      {
        href: "/espace/mes-fios",
        labelKey: "myFios",
        descriptionKey: "myFiosDesc",
        requiresAuth: true,
      },
    ],
  },
  {
    id: "resources",
    labelKey: "megaResources",
    links: [
      {
        href: "/blog",
        labelKey: "blog",
        descriptionKey: "blogDesc",
      },
      {
        href: "/magazine",
        labelKey: "magazine",
        descriptionKey: "magazineDesc",
      },
      {
        href: "/evenements",
        labelKey: "events",
        descriptionKey: "eventsDesc",
      },
    ],
  },
  {
    id: "support",
    labelKey: "megaSupport",
    links: [
      {
        href: "/nous-rejoindre",
        labelKey: "joinUs",
        descriptionKey: "joinUsDesc",
      },
      {
        href: "/a-votre-ecoute",
        labelKey: "listen",
        descriptionKey: "listenDesc",
      },
      {
        href: "/jai-besoin-de-prieres",
        labelKey: "prayer",
        descriptionKey: "prayerDesc",
      },
    ],
  },
];

export function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isMegaMenuActive(
  pathname: string,
  links: SiteNavLink[],
): boolean {
  return links.some((link) => isNavLinkActive(pathname, link.href));
}

export function visibleNavLinks(
  links: SiteNavLink[],
  isAuthenticated: boolean,
): SiteNavLink[] {
  return links.filter((link) => !link.requiresAuth || isAuthenticated);
}
