import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EventBannerImage } from "@/components/events/EventBannerImage";
import { formatDate } from "@/lib/utils/dates";
import type { IccEvent } from "@/lib/wp/types";

type Props = {
  events: IccEvent[];
  locale: string;
};

export async function FioGroupEventsSection({ events, locale }: Props) {
  const t = await getTranslations("community");
  if (events.length === 0) return null;

  return (
    <section className="border-t border-black/8 bg-icc-cream/30 py-10 md:py-12">
      <div className="container-icc max-w-6xl">
        <h2 className="text-2xl font-extrabold tracking-tight text-icc-ink">
          {t("groupEventsTitle")}
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/evenements/${encodeURIComponent(event.slug)}`}
              className="group overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-icc-coral/25"
            >
              {event.bannerUrl ? (
                <div className="relative aspect-[16/10] overflow-hidden bg-icc-cream">
                  <EventBannerImage
                    src={event.bannerUrl}
                    alt={event.title}
                    layout="cover"
                    className="transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              ) : null}
              <div className="p-4">
                <p className="text-xs font-medium text-icc-muted">
                  {formatDate(event.startDate, locale)}
                </p>
                <h3 className="mt-1 font-bold text-icc-ink group-hover:text-icc-coral">
                  {event.title}
                </h3>
                {event.excerpt ? (
                  <p className="mt-2 line-clamp-2 text-sm text-icc-muted">{event.excerpt}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
