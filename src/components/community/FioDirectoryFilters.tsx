"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  FIO_CATEGORY_ORDER,
  getFioPrimaryCategory,
} from "@/lib/wp/fio-categories";
import {
  isFioSchedulePlaceholder,
  sortWeekdays,
  translateWeekday,
} from "@/lib/utils/fio-schedule";
import type { WpFio } from "@/lib/wp/community-types";

type Props = {
  fios: WpFio[];
  onChange: (filtered: WpFio[]) => void;
};

function isPlaceholder(value: string): boolean {
  return isFioSchedulePlaceholder(value);
}

export function FioDirectoryFilters({ fios, onChange }: Props) {
  const t = useTranslations("community");
  const locale = useLocale();
  const [day, setDay] = useState("");
  const [pillar, setPillar] = useState("");
  const [category, setCategory] = useState("");

  const days = useMemo(
    () =>
      sortWeekdays([
        ...new Set(fios.map((fio) => fio.jour).filter((value) => !isPlaceholder(value))),
      ]),
    [fios],
  );

  const pillars = useMemo(
    () =>
      [
        ...new Set(fios.map((fio) => fio.pilier).filter((value) => !isPlaceholder(value))),
      ].sort((a, b) => a.localeCompare(b, "fr")),
    [fios],
  );

  useEffect(() => {
    const filtered = fios.filter((fio) => {
      if (day && fio.jour !== day) return false;
      if (pillar && fio.pilier !== pillar) return false;
      if (category) {
        const fioCategory = fio.category ?? getFioPrimaryCategory(fio.types);
        if (fioCategory !== category) return false;
      }
      return true;
    });
    onChange(filtered);
  }, [category, day, fios, onChange, pillar]);

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-icc-muted">
          {t("filterDay")}
        </span>
        <select
          value={day}
          onChange={(event) => setDay(event.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-icc-ink outline-none focus:border-icc-coral focus:ring-2 focus:ring-icc-coral/20"
        >
          <option value="">{t("filterDayAll")}</option>
          {days.map((value) => (
            <option key={value} value={value}>
              {translateWeekday(value, locale)}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-icc-muted">
          {t("filterPillar")}
        </span>
        <select
          value={pillar}
          onChange={(event) => setPillar(event.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-icc-ink outline-none focus:border-icc-coral focus:ring-2 focus:ring-icc-coral/20"
        >
          <option value="">{t("filterPillarAll")}</option>
          {pillars.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-icc-muted">
          {t("filterCategory")}
        </span>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-icc-ink outline-none focus:border-icc-coral focus:ring-2 focus:ring-icc-coral/20"
        >
          <option value="">{t("filterCategoryAll")}</option>
          {FIO_CATEGORY_ORDER.map((value) => (
            <option key={value} value={value}>
              {t(`groupCategory_${value}` as "groupCategory_fio")}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}