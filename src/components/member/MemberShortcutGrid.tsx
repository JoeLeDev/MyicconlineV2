import { getTranslations } from "next-intl/server";
import { MemberShortcutCard } from "@/components/member/MemberShortcutCard";
import {
  V2_SHORTCUTS,
  WP_COMMUNITY_LINKS,
  type CommunityLinkId,
  type V2ShortcutId,
} from "@/lib/wp/community-links";

function IconNewspaper() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 5h16v14H4V5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M7 9h10M7 13h6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPen() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 3v2M17 3v2M4 8h16M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconActivity() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 14l4-4 4 6 4-8 4 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 11a3 3 0 1 0-6 0M3 20a5 5 0 0 1 10 0M17 8a2.5 2.5 0 1 0 0-5M21 20a4 4 0 0 0-8 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconGroups() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 2 8l10 5 10-5-10-5ZM2 13l10 5 10-5M2 18l10 5 10-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconHome() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const WP_ICONS: Record<CommunityLinkId, () => React.ReactNode> = {
  publications: IconNewspaper,
  submitArticle: IconPen,
  events: IconCalendar,
  activity: IconActivity,
  members: IconUsers,
  groups: IconGroups,
  community: IconHome,
};

const V2_ICONS: Record<V2ShortcutId, () => React.ReactNode> = {
  blog: IconNewspaper,
  home: IconHome,
};

export async function MemberShortcutGrid() {
  const t = await getTranslations("memberSpace");

  return (
    <div className="space-y-10">
      <section aria-labelledby="community-shortcuts-heading">
        <h2
          id="community-shortcuts-heading"
          className="text-lg font-bold tracking-tight text-icc-ink md:text-xl"
        >
          {t("communityShortcuts")}
        </h2>
        <ul className="mt-5 grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {WP_COMMUNITY_LINKS.map((link) => {
            const Icon = WP_ICONS[link.id];
            return (
              <li key={link.id}>
                <MemberShortcutCard
                  href={link.href}
                  title={t(`shortcuts.${link.id}.title`)}
                  description={t(`shortcuts.${link.id}.description`)}
                  icon={<Icon />}
                  external={link.external ?? true}
                  ariaLabel={
                    link.external ?? true
                      ? `${t(`shortcuts.${link.id}.title`)} — ${t("opensNewTab")}`
                      : t(`shortcuts.${link.id}.title`)
                  }
                />
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="v2-shortcuts-heading">
        <h2
          id="v2-shortcuts-heading"
          className="text-lg font-bold tracking-tight text-icc-ink md:text-xl"
        >
          {t("v2Shortcuts")}
        </h2>
        <ul className="mt-5 grid list-none gap-4 sm:grid-cols-2">
          {V2_SHORTCUTS.map((link) => {
            const Icon = V2_ICONS[link.id];
            return (
              <li key={link.id}>
                <MemberShortcutCard
                  href={link.href}
                  title={t(`v2.${link.id}.title`)}
                  description={t(`v2.${link.id}.description`)}
                  icon={<Icon />}
                />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
