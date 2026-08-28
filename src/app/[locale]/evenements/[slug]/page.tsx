import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PostContent } from "@/components/blog/PostContent";
import { EventBannerImage } from "@/components/events/EventBannerImage";
import { Link } from "@/i18n/navigation";
import { formatEventSchedule } from "@/lib/utils/dates";
import { getAllEventSlugs, getEventBySlug } from "@/lib/wp/events";

export const revalidate = 300;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  try {
    const slugs = await getAllEventSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  const event = await getEventBySlug(slug).catch(() => null);

  if (!event) {
    return { title: t("notFoundTitle") };
  }

  return {
    title: event.title,
    description: event.excerpt || undefined,
    openGraph: {
      title: event.title,
      description: event.excerpt || undefined,
      type: "website",
      images: event.bannerUrl ? [{ url: event.bannerUrl }] : undefined,
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("events");
  const event = await getEventBySlug(slug).catch(() => null);

  if (!event) notFound();

  const schedule = formatEventSchedule(
    event.startDate,
    event.endDate,
    locale,
    event.startTime,
    event.endTime,
  );
  const locationLabel = event.online ? t("online") : event.location;

  return (
    <article className="bg-white py-12 md:py-16">
      <div className="container-icc max-w-3xl">
        <Link
          href="/evenements"
          className="inline-flex text-sm font-semibold text-icc-coral hover:text-icc-coral-deep"
        >
          {t("backToList")}
        </Link>

        {event.bannerUrl ? (
          <div className="mt-8 overflow-hidden rounded-xl bg-icc-cream">
            <EventBannerImage
              src={event.bannerUrl}
              alt={event.title}
              layout="full"
              priority
            />
          </div>
        ) : null}

        <header className={event.bannerUrl ? "mt-8" : "mt-6"}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-icc-coral">
            {event.isUpcoming ? <span>{t("upcomingBadge")}</span> : null}
            {schedule ? (
              <span className="font-medium normal-case tracking-normal text-icc-muted">
                {schedule}
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 text-[clamp(2rem,5.5vw,3.4rem)] font-extrabold leading-[1.1] tracking-tight text-icc-ink">
            {event.title}
          </h1>

          {locationLabel ? (
            <p className="mt-4 text-sm text-icc-muted md:text-base">
              {locationLabel}
            </p>
          ) : null}
        </header>

        <div className="mt-10">
          <PostContent html={event.contentHtml} />
        </div>
      </div>
    </article>
  );
}
