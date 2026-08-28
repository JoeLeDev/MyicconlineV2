"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { EventBannerImage } from "@/components/events/EventBannerImage";
import { normalizeCommunityPlainText } from "@/lib/utils/community-text";
import type { WpFio } from "@/lib/wp/community-types";

function fioDetailPath(slug: string): `/groupes/${string}` {
  return `/groupes/${encodeURIComponent(slug)}`;
}

type Props = {
  fio: WpFio;
};

function isPlaceholder(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return !normalized || normalized === "non défini" || normalized === "non renseigné";
}

export function FioCardClient({ fio }: Props) {
  const t = useTranslations("community");
  const schedule = [fio.jour, fio.horaire].filter((v) => !isPlaceholder(v)).join(" · ");

  return (
    <Link
      href={fioDetailPath(fio.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-icc-coral/25 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-icc-cream">
        {fio.image ? (
          <EventBannerImage
            src={fio.image}
            alt={fio.nom}
            layout="cover"
            className="transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-icc-warm-brown/35 to-icc-coral/25" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-bold tracking-tight text-icc-ink group-hover:text-icc-coral">
          {fio.nom}
        </h2>
        {fio.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-icc-muted">
            {normalizeCommunityPlainText(fio.description)}
          </p>
        ) : null}
        <div className="mt-auto space-y-1 pt-4 text-sm text-icc-muted">
          {schedule ? <p>{schedule}</p> : null}
          {!isPlaceholder(fio.pilote) ? (
            <p>{t("pilot", { name: fio.pilote })}</p>
          ) : null}
          <p>{t("membersCountShort", { count: fio.membres })}</p>
        </div>
      </div>
    </Link>
  );
}
