"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FioCardBanner } from "@/components/community/FioCardBanner";
import { normalizeCommunityPlainText } from "@/lib/utils/community-text";
import { formatFioSchedule, isFioSchedulePlaceholder } from "@/lib/utils/fio-schedule";
import {
  getCategoryAccentClass,
  getFioPrimaryCategory,
  type FioCategorySlug,
} from "@/lib/wp/fio-categories";
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

export function FioCardClient({ fio }: Props) {
  const t = useTranslations("community");
  const locale = useLocale();
  const schedule = formatFioSchedule(fio.jour, fio.horaire, locale);
  const category = (fio.category ??
    getFioPrimaryCategory(fio.types)) as FioCategorySlug;
  const categoryLabel = t(
    category === "other"
      ? "groupCategoryOther"
      : (`groupCategory_${category}` as "groupCategory_fio"),
  );

  return (
    <Link
      href={fioDetailPath(fio.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-icc-coral/25 hover:shadow-md"
    >
      <FioCardBanner
        image={fio.image}
        name={fio.nom}
        category={category}
        categoryLabel={categoryLabel}
        schedule={schedule || undefined}
      />

      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-bold tracking-tight text-icc-ink group-hover:text-icc-coral">
          {fio.nom}
        </h2>
        {fio.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-icc-muted">
            {normalizeCommunityPlainText(fio.description)}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={[
              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
              getCategoryAccentClass(category),
            ].join(" ")}
          >
            {categoryLabel}
          </span>
          {!isPlaceholder(fio.pilier) ? (
            <span className="inline-flex rounded-full bg-icc-cream px-2.5 py-1 text-xs font-medium text-icc-ink">
              {fio.pilier}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-sm text-icc-muted">
          <span>{t("membersCountShort", { count: fio.membres })}</span>
          {fio.zoom_link ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-icc-coral">
              <span aria-hidden>🌐</span>
              {t("meetsOnline")}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
