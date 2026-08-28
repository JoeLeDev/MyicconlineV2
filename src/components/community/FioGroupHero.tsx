import { EventBannerImage } from "@/components/events/EventBannerImage";
import { Link } from "@/i18n/navigation";
import { JoinFioButton } from "@/components/community/JoinFioButton";
import { CommunityText } from "@/components/community/CommunityText";
import type { WpFio } from "@/lib/wp/community-types";

type Props = {
  fio: WpFio;
  schedule: string;
  backLabel: string;
  eyebrow: string;
  pilotLabel: string;
  cityLabel: string;
  membersLabel: string;
  membersCount: string;
  joinZoomLabel: string;
};

function isPlaceholder(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return !normalized || normalized === "non défini" || normalized === "non renseigné";
}

export function FioGroupHero({
  fio,
  schedule,
  backLabel,
  eyebrow,
  pilotLabel,
  cityLabel,
  membersLabel,
  membersCount,
  joinZoomLabel,
}: Props) {
  return (
    <section className="relative min-h-[min(72vh,34rem)] overflow-hidden bg-icc-ink">
      {fio.image ? (
        <EventBannerImage
          src={fio.image}
          alt={fio.nom}
          layout="cover"
          priority
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-icc-warm-brown/80 to-icc-coral/70"
          aria-hidden
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-icc-ink from-20% via-icc-ink/55 via-55% to-black/10"
        aria-hidden
      />

      <div className="container-icc relative z-10 flex min-h-[min(72vh,34rem)] max-w-5xl flex-col justify-end pb-8 pt-16 md:pb-12 md:pt-20">
        <Link
          href="/groupes"
          className="inline-flex text-sm font-semibold text-white/90 transition hover:text-white"
        >
          {backLabel}
        </Link>

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-icc-coral-hot">
          {eyebrow}
        </p>
        <h1 className="mt-2 max-w-3xl text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.08] tracking-tight text-white">
          {fio.nom}
        </h1>

        {fio.description ? (
          <CommunityText
            text={fio.description}
            className="prose-icc mt-4 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg [&_p:last-child]:mb-0 [&_strong]:text-white"
          />
        ) : null}

        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/85">
          {schedule ? (
            <div>
              <dt className="sr-only">{schedule}</dt>
              <dd>{schedule}</dd>
            </div>
          ) : null}
          {!isPlaceholder(fio.pilote) ? (
            <div>
              <dt className="font-semibold text-white">{pilotLabel}</dt>
              <dd>{fio.pilote}</dd>
            </div>
          ) : null}
          {!isPlaceholder(fio.ville || "") ? (
            <div>
              <dt className="font-semibold text-white">{cityLabel}</dt>
              <dd>{fio.ville}</dd>
            </div>
          ) : null}
          <div>
            <dt className="font-semibold text-white">{membersLabel}</dt>
            <dd>{membersCount}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {fio.zoom_link ? (
            <a
              href={fio.zoom_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              {joinZoomLabel}
            </a>
          ) : null}
          <JoinFioButton
            fioId={fio.id}
            fioName={fio.nom}
            fioSlug={fio.slug}
            variant="hero"
          />
        </div>
      </div>
    </section>
  );
}
