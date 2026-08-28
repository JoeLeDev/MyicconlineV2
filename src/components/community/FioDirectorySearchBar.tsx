"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  FIO_CATEGORY_ORDER,
  getFioPrimaryCategory,
  type FioCategorySlug,
} from "@/lib/wp/fio-categories";
import {
  isFioSchedulePlaceholder,
  sortWeekdays,
  translateWeekday,
} from "@/lib/utils/fio-schedule";
import type { WpFio } from "@/lib/wp/community-types";

export type FioDirectoryFilterState = {
  query: string;
  days: string[];
  pillar: string;
  category: string;
  onlineOnly: boolean;
};

type Props = {
  fios: WpFio[];
  value: FioDirectoryFilterState;
  onChange: (next: FioDirectoryFilterState) => void;
  resultCount: number;
};

function isPlaceholder(value: string): boolean {
  return isFioSchedulePlaceholder(value);
}

function pillClass(active: boolean): string {
  return [
    "rounded-full border px-4 py-2 text-sm font-medium transition",
    active
      ? "border-icc-ink bg-icc-ink text-white"
      : "border-black/15 bg-white text-icc-ink hover:border-black/30",
  ].join(" ");
}

type PopoverId = "pillar" | "category" | null;

export function FioDirectorySearchBar({
  fios,
  value,
  onChange,
  resultCount,
}: Props) {
  const t = useTranslations("community");
  const locale = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const [openPopover, setOpenPopover] = useState<PopoverId>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const days = useMemo(
    () =>
      sortWeekdays([
        ...new Set(fios.map((fio) => fio.jour).filter((v) => !isPlaceholder(v))),
      ]),
    [fios],
  );

  const pillars = useMemo(
    () =>
      [...new Set(fios.map((fio) => fio.pilier).filter((v) => !isPlaceholder(v)))].sort(
        (a, b) => a.localeCompare(b, "fr"),
      ),
    [fios],
  );

  const activeAdvancedCount =
    value.days.length +
    (value.onlineOnly ? 1 : 0) +
    (value.pillar ? 1 : 0) +
    (value.category ? 1 : 0);
  const hasActiveFilters = activeAdvancedCount > 0;

  const pillarLabel = value.pillar || t("filterPillarHint");
  const categoryLabel = value.category
    ? t(`groupCategory_${value.category}` as "groupCategory_fio")
    : t("filterCategoryHint");

  useEffect(() => {
    if (!modalOpen) setDraft(value);
  }, [modalOpen, value]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenPopover(null);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setModalOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  const patch = useCallback(
    (partial: Partial<FioDirectoryFilterState>) => {
      onChange({ ...value, ...partial });
    },
    [onChange, value],
  );

  const toggleDraftDay = (day: string) => {
    setDraft((current) => ({
      ...current,
      days: current.days.includes(day)
        ? current.days.filter((d) => d !== day)
        : [...current.days, day],
    }));
  };

  const resetDraft = () => {
    setDraft({
      ...value,
      days: [],
      pillar: "",
      category: "",
      onlineOnly: false,
    });
  };

  const applyDraft = () => {
    onChange({
      ...value,
      days: draft.days,
      pillar: draft.pillar,
      category: draft.category,
      onlineOnly: draft.onlineOnly,
    });
    setModalOpen(false);
  };

  return (
    <>
      <div ref={rootRef} className="mb-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-black/10 bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:rounded-full md:p-2.5">
          {/* Mobile : recherche compacte + bouton Filtres */}
          <div className="flex items-center gap-2 md:hidden">
            <label className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-black/8 bg-black/[0.02] px-3 py-2.5">
              <span className="sr-only">{t("searchGroups")}</span>
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0 text-icc-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                value={value.query}
                onChange={(event) => patch({ query: event.target.value })}
                placeholder={t("searchGroupsPlaceholder")}
                className="min-w-0 flex-1 bg-transparent text-sm text-icc-ink outline-none placeholder:text-icc-muted"
              />
            </label>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              aria-label={t("filterMore")}
              className={[
                "relative inline-flex shrink-0 items-center justify-center rounded-xl border px-3 py-2.5 transition",
                hasActiveFilters
                  ? "border-icc-ink bg-icc-ink text-white"
                  : "border-black/10 bg-white text-icc-ink hover:border-black/20",
              ].join(" ")}
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 7h16M7 12h10M10 17h4" />
              </svg>
              {hasActiveFilters ? (
                <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-icc-coral px-1 text-[11px] font-bold text-white">
                  {activeAdvancedCount}
                </span>
              ) : null}
            </button>
          </div>

          {/* Desktop : barre pill complète */}
          <div className="hidden md:flex md:items-stretch">
            <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full px-4 py-2 md:py-3">
              <span className="sr-only">{t("searchGroups")}</span>
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-5 w-5 shrink-0 text-icc-ink"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-icc-ink">
                  {t("filterSearchLabel")}
                </span>
                <input
                  type="search"
                  value={value.query}
                  onChange={(event) => patch({ query: event.target.value })}
                  placeholder={t("searchGroupsPlaceholder")}
                  className="mt-0.5 w-full bg-transparent text-sm text-icc-ink outline-none placeholder:text-icc-muted"
                />
              </span>
            </label>

            <div className="hidden w-px self-stretch bg-black/10 md:block" />

            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() =>
                  setOpenPopover((current) =>
                    current === "pillar" ? null : "pillar",
                  )
                }
                className="flex h-full min-w-[9rem] flex-col justify-center rounded-full px-5 py-2 text-left transition hover:bg-black/[0.03]"
              >
                <span className="text-xs font-semibold text-icc-ink">
                  {t("filterPillar")}
                </span>
                <span className="mt-0.5 truncate text-sm text-icc-muted">
                  {pillarLabel}
                </span>
              </button>
              {openPopover === "pillar" ? (
                <div className="absolute left-0 top-[calc(100%+0.5rem)] z-30 max-h-64 w-72 overflow-y-auto rounded-2xl border border-black/10 bg-white py-2 shadow-xl">
                  <button
                    type="button"
                    className="block w-full px-4 py-2.5 text-left text-sm hover:bg-icc-cream/60"
                    onClick={() => {
                      patch({ pillar: "" });
                      setOpenPopover(null);
                    }}
                  >
                    {t("filterPillarAll")}
                  </button>
                  {pillars.map((pillar) => (
                    <button
                      key={pillar}
                      type="button"
                      className={[
                        "block w-full px-4 py-2.5 text-left text-sm hover:bg-icc-cream/60",
                        value.pillar === pillar ? "font-semibold text-icc-coral" : "",
                      ].join(" ")}
                      onClick={() => {
                        patch({ pillar });
                        setOpenPopover(null);
                      }}
                    >
                      {pillar}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="hidden w-px self-stretch bg-black/10 md:block" />

            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() =>
                  setOpenPopover((current) =>
                    current === "category" ? null : "category",
                  )
                }
                className="flex h-full min-w-[9rem] flex-col justify-center rounded-full px-5 py-2 text-left transition hover:bg-black/[0.03]"
              >
                <span className="text-xs font-semibold text-icc-ink">
                  {t("filterCategory")}
                </span>
                <span className="mt-0.5 truncate text-sm text-icc-muted">
                  {categoryLabel}
                </span>
              </button>
              {openPopover === "category" ? (
                <div className="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-64 overflow-hidden rounded-2xl border border-black/10 bg-white py-2 shadow-xl">
                  <button
                    type="button"
                    className="block w-full px-4 py-2.5 text-left text-sm hover:bg-icc-cream/60"
                    onClick={() => {
                      patch({ category: "" });
                      setOpenPopover(null);
                    }}
                  >
                    {t("filterCategoryAll")}
                  </button>
                  {FIO_CATEGORY_ORDER.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={[
                        "block w-full px-4 py-2.5 text-left text-sm hover:bg-icc-cream/60",
                        value.category === cat ? "font-semibold text-icc-coral" : "",
                      ].join(" ")}
                      onClick={() => {
                        patch({ category: cat });
                        setOpenPopover(null);
                      }}
                    >
                      {t(`groupCategory_${cat}` as "groupCategory_fio")}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="hidden w-px self-stretch bg-black/10 md:block" />

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-icc-ink transition hover:border-black/20 md:my-1 md:mr-1 md:py-0"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 7h16M7 12h10M10 17h4" />
              </svg>
              {t("filterMore")}
              {hasActiveFilters ? (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-icc-coral px-1.5 text-[11px] font-bold text-white">
                  {activeAdvancedCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <p className="mt-3 text-center text-sm text-icc-muted md:text-left">
          {t("groupsCount", { count: resultCount })}
        </p>
      </div>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
          role="presentation"
          onClick={() => setModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="fio-filters-title"
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/8 px-6 py-4">
              <h2 id="fio-filters-title" className="text-lg font-bold text-icc-ink">
                {t("filterMoreTitle")}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"
                aria-label={t("filterClose")}
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <section>
                <h3 className="text-base font-bold text-icc-ink">
                  {t("filterPillar")}
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={pillClass(!draft.pillar)}
                    onClick={() => setDraft((current) => ({ ...current, pillar: "" }))}
                  >
                    {t("filterPillarAll")}
                  </button>
                  {pillars.map((pillar) => (
                    <button
                      key={pillar}
                      type="button"
                      className={pillClass(draft.pillar === pillar)}
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          pillar: current.pillar === pillar ? "" : pillar,
                        }))
                      }
                    >
                      {pillar}
                    </button>
                  ))}
                </div>
              </section>

              <section className="mt-8 border-t border-black/8 pt-6">
                <h3 className="text-base font-bold text-icc-ink">
                  {t("filterSchedule")}
                </h3>
                <p className="mt-1 text-sm text-icc-muted">{t("filterMeetingDays")}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {days.map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={pillClass(draft.days.includes(day))}
                      onClick={() => toggleDraftDay(day)}
                    >
                      {translateWeekday(day, locale)}
                    </button>
                  ))}
                </div>
              </section>

              <section className="mt-8 border-t border-black/8 pt-6">
                <h3 className="text-base font-bold text-icc-ink">
                  {t("filterCategory")}
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {FIO_CATEGORY_ORDER.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={pillClass(draft.category === cat)}
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          category: current.category === cat ? "" : cat,
                        }))
                      }
                    >
                      {t(`groupCategory_${cat}` as "groupCategory_fio")}
                    </button>
                  ))}
                </div>
              </section>

              <section className="mt-8 border-t border-black/8 pt-6">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={draft.onlineOnly}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        onlineOnly: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-black/20 text-icc-coral focus:ring-icc-coral/30"
                  />
                  <span className="text-sm font-medium text-icc-ink">
                    {t("filterOnlineOnly")}
                  </span>
                </label>
              </section>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-black/8 px-6 py-4">
              <button
                type="button"
                onClick={resetDraft}
                className="text-sm font-semibold text-icc-ink underline-offset-2 hover:underline"
              >
                {t("filterReset")}
              </button>
              <button
                type="button"
                onClick={applyDraft}
                className="rounded-full bg-icc-ink px-8 py-3 text-sm font-semibold text-white transition hover:bg-icc-ink/90"
              >
                {t("filterDone")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function applyFioDirectoryFilters(
  fios: WpFio[],
  filters: FioDirectoryFilterState,
  locale: string,
  translateCategory: (category: FioCategorySlug | "other") => string,
): WpFio[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return fios.filter((fio) => {
    if (filters.days.length > 0 && !filters.days.includes(fio.jour)) {
      return false;
    }
    if (filters.pillar && fio.pilier !== filters.pillar) return false;
    if (filters.category) {
      const fioCategory = (fio.category ??
        getFioPrimaryCategory(fio.types)) as FioCategorySlug;
      if (fioCategory !== filters.category) return false;
    }
    if (filters.onlineOnly && !fio.zoom_link?.trim()) return false;

    if (!normalizedQuery) return true;

    const category = (fio.category ??
      getFioPrimaryCategory(fio.types)) as FioCategorySlug;
    const categoryLabel = translateCategory(category);

    const haystack = [
      fio.nom,
      fio.description,
      fio.pilote,
      fio.pilier,
      fio.ville,
      fio.jour,
      translateWeekday(fio.jour, locale),
      categoryLabel,
      ...(fio.types ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export const DEFAULT_FIO_DIRECTORY_FILTERS: FioDirectoryFilterState = {
  query: "",
  days: [],
  pillar: "",
  category: "",
  onlineOnly: false,
};
