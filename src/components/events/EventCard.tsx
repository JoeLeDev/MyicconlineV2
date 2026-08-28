import { getTranslations } from "next-intl/server";
import { EventBannerImage } from "@/components/events/EventBannerImage";
import type { IccEvent } from "@/lib/wp/types";
import { Link } from "@/i18n/navigation";
import { formatEventSchedule } from "@/lib/utils/dates";

type Props = {
  event: IccEvent;
  locale?: string;
  featured?: boolean;
};

export async function EventCard({
  event,
  locale = "fr",
  featured = false,
}: Props) {
  const t = await getTranslations("events");
  const schedule = formatEventSchedule(
    event.startDate,
    event.endDate,
    locale,
  );
  const locationLabel = event.online ? t("online") : event.location;

  return (
    <article className="group border-b border-black/8 py-8 first:pt-0 last:border-b-0">
      <Link
        href={`/evenements/${event.slug}`}
        className={[
          "grid gap-6",
          featured
            ? "md:grid-cols-[1.15fr_1fr] md:items-center"
            : "md:grid-cols-[220px_1fr] md:items-start",
        ].join(" ")}
      >
        <div
          className={[
            "relative overflow-hidden bg-icc-cream",
            featured
              ? "aspect-[16/10] md:aspect-[5/3]"
              : "aspect-[16/10] md:aspect-[4/3]",
          ].join(" ")}
        >
          {event.bannerUrl ? (
            <EventBannerImage
              src={event.bannerUrl}
              alt={event.title}
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes={
                featured
                  ? "(max-width:768px) 100vw, 55vw"
                  : "(max-width:768px) 100vw, 220px"
              }
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-icc-warm-brown/40 to-icc-coral/30" />
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-icc-coral">
            {event.isUpcoming ? (
              <span>{t("upcomingBadge")}</span>
            ) : null}
            <span className="font-medium normal-case tracking-normal text-icc-muted">
              {schedule}
            </span>
          </div>
          <h2
            className={[
              "mt-2 font-bold tracking-tight text-icc-ink transition group-hover:text-icc-coral-deep",
              featured
                ? "text-[clamp(1.5rem,3vw,2.15rem)] leading-tight"
                : "text-xl md:text-2xl leading-snug",
            ].join(" ")}
          >
            {event.title}
          </h2>
          {locationLabel ? (
            <p className="mt-2 text-sm font-medium text-icc-muted">
              {locationLabel}
            </p>
          ) : null}
          {event.excerpt ? (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-icc-muted md:text-base">
              {event.excerpt}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
