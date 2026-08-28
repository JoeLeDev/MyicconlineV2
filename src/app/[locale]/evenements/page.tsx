import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PostContent } from "@/components/blog/PostContent";
import { WpContentLocaleNotice } from "@/components/cms/WpContentLocaleNotice";
import { EventCard } from "@/components/events/EventCard";
import { EventsScopeTabs } from "@/components/events/EventsScopeTabs";
import { Link } from "@/i18n/navigation";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { isDefaultWpContentLocale } from "@/lib/wp/content-locale";
import {
  EVENTS_PAGE_WP_SLUG,
  getEvents,
  isMinimalEventsIntro,
} from "@/lib/wp/events";
import { getPageBySlug } from "@/lib/wp/pages";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ scope?: string; page?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  return buildPageMetadata({
    locale,
    href: "/evenements",
    title: t("title"),
    description: t("subtitle"),
  });
}

function buildListHref(
  scope: "upcoming" | "past",
  page: number,
): string | { pathname: "/evenements"; query: Record<string, string> } {
  const query: Record<string, string> = {};
  if (scope === "past") query.scope = "past";
  if (page > 1) query.page = String(page);

  if (Object.keys(query).length === 0) {
    return "/evenements";
  }

  return { pathname: "/evenements", query };
}

export default async function EventsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("events");
  const query = await searchParams;
  const scope = query.scope === "past" ? "past" : "upcoming";
  const page = Math.max(1, Number(query.page) || 1);

  const introPage = await getPageBySlug(EVENTS_PAGE_WP_SLUG).catch(() => null);
  const wpIntroHtml = introPage?.introHtml.trim() ?? "";
  const useWpIntro =
    isDefaultWpContentLocale(locale) &&
    wpIntroHtml.length > 0 &&
    !isMinimalEventsIntro(wpIntroHtml);

  let events: Awaited<ReturnType<typeof getEvents>>["events"] = [];
  let totalPages = 1;
  let error: string | null = null;

  try {
    const result = await getEvents({ scope, page, perPage: 10 });
    events = result.events;
    totalPages = result.totalPages || 1;
  } catch {
    error = t("error");
  }

  const emptyMessage =
    scope === "past" ? t("emptyPast") : t("emptyUpcoming");

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="container-icc max-w-4xl">
        <header className="mb-8 md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3.2rem)] font-extrabold tracking-tight text-icc-ink">
            {t("title")}
          </h1>
          {useWpIntro ? (
            <div className="mt-4 max-w-3xl">
              <PostContent html={wpIntroHtml} />
            </div>
          ) : (
            <div className="mt-4 max-w-3xl space-y-3 text-base leading-relaxed text-icc-muted md:text-lg">
              <p>{t("introLead")}</p>
              <p>{t("introBody")}</p>
            </div>
          )}
        </header>

        <Suspense
          fallback={
            <div className="mb-8 h-10 animate-pulse rounded-lg bg-icc-cream" />
          }
        >
          <div className="mb-8">
            <EventsScopeTabs />
          </div>
        </Suspense>

        <WpContentLocaleNotice locale={locale} namespace="events" />

        {error ? (
          <p className="rounded-lg border border-icc-coral/30 bg-icc-cream px-4 py-3 text-sm text-icc-ink">
            {error}
          </p>
        ) : null}

        {!error && events.length === 0 ? (
          <p className="text-icc-muted">{emptyMessage}</p>
        ) : null}

        <div>
          {events.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              locale={locale}
              featured={page === 1 && index === 0 && scope === "upcoming"}
            />
          ))}
        </div>

        {!error && totalPages > 1 ? (
          <nav
            className="mt-12 flex items-center justify-between border-t border-black/10 pt-6 text-sm font-semibold"
            aria-label="Pagination"
          >
            {page > 1 ? (
              <Link
                href={buildListHref(scope, page - 1)}
                className="text-icc-coral hover:text-icc-coral-deep"
              >
                {t("prev")}
              </Link>
            ) : (
              <span />
            )}
            <span className="text-icc-muted">
              {t("page", { page, total: totalPages })}
            </span>
            {page < totalPages ? (
              <Link
                href={buildListHref(scope, page + 1)}
                className="text-icc-coral hover:text-icc-coral-deep"
              >
                {t("next")}
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </div>
    </div>
  );
}
