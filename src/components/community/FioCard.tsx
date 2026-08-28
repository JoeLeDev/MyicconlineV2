import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { normalizeCommunityPlainText } from "@/lib/utils/community-text";
import { formatFioSchedule, isFioSchedulePlaceholder } from "@/lib/utils/fio-schedule";
import type { WpFio } from "@/lib/wp/community-types";

function fioDetailPath(slug: string): `/groupes/${string}` {
  return `/groupes/${encodeURIComponent(slug)}`;
}

type Props = {
  fio: WpFio;
};

function isPlaceholder(value: string): boolean {
  return isFioSchedulePlaceholder(value);
}

export async function FioCard({ fio }: Props) {
  const t = await getTranslations("community");
  const locale = await getLocale();
  const schedule = formatFioSchedule(fio.jour, fio.horaire, locale);

  return (
    <Link
      href={fioDetailPath(fio.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-black/8 bg-white transition hover:border-icc-coral/30 hover:shadow-sm"
    >
      <div className="relative aspect-[16/9] bg-icc-cream">
        {fio.image ? (
          <Image
            src={fio.image}
            alt={fio.nom}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
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
          <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-icc-muted">
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
