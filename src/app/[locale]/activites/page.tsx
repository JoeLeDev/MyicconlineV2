import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ActivityCard } from "@/components/community/ActivityCard";
import { Link } from "@/i18n/navigation";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getActivities } from "@/lib/wp/community";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export const revalidate = 120;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "community" });
  return buildPageMetadata({
    locale,
    href: "/activites",
    title: t("activitiesTitle"),
    description: t("activitiesSubtitle"),
  });
}

export default async function ActivitiesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("community");
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);

  let activities: Awaited<ReturnType<typeof getActivities>>["activities"] = [];
  let hasMore = false;
  let error: string | null = null;

  try {
    const result = await getActivities({ page, perPage: 15 });
    activities = result.activities;
    hasMore = result.has_more;
  } catch {
    error = t("error");
  }

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="container-icc max-w-3xl">
        <header className="mb-8 md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
            {t("activitiesEyebrow")}
          </p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight text-icc-ink">
            {t("activitiesTitle")}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-icc-muted md:text-lg">
            {t("activitiesSubtitle")}
          </p>
        </header>

        {error ? (
          <p className="rounded-lg border border-icc-coral/30 bg-icc-cream px-4 py-3 text-sm text-icc-ink">
            {error}
          </p>
        ) : null}

        {!error && activities.length === 0 ? (
          <p className="text-icc-muted">{t("emptyActivities")}</p>
        ) : null}

        <div>
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} locale={locale} />
          ))}
        </div>

        {!error && (page > 1 || hasMore) ? (
          <nav
            className="mt-10 flex items-center justify-between border-t border-black/10 pt-6 text-sm font-semibold"
            aria-label="Pagination"
          >
            {page > 1 ? (
              <Link
                href={
                  page === 2
                    ? "/activites"
                    : { pathname: "/activites", query: { page: String(page - 1) } }
                }
                className="text-icc-coral hover:text-icc-coral-deep"
              >
                {t("prev")}
              </Link>
            ) : (
              <span />
            )}
            <span className="text-icc-muted">{t("page", { page })}</span>
            {hasMore ? (
              <Link
                href={{ pathname: "/activites", query: { page: String(page + 1) } }}
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
