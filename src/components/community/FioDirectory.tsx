"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FioCategorySection } from "@/components/community/FioCategorySection";
import { FioDirectoryFilters } from "@/components/community/FioDirectoryFilters";
import {
  getFioPrimaryCategory,
  getOrderedCategorySections,
  groupFiosByCategory,
} from "@/lib/wp/fio-categories";
import type { WpFio } from "@/lib/wp/community-types";

type Props = {
  fios: WpFio[];
};

export function FioDirectory({ fios }: Props) {
  const t = useTranslations("community");
  const [query, setQuery] = useState("");
  const [filteredByControls, setFilteredByControls] = useState(fios);

  const handleFilterChange = useCallback((next: WpFio[]) => {
    setFilteredByControls(next);
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return filteredByControls;

    return filteredByControls.filter((fio) => {
      const category = fio.category ?? getFioPrimaryCategory(fio.types);
      const categoryLabel = t(
        category === "other"
          ? "groupCategoryOther"
          : (`groupCategory_${category}` as "groupCategory_fio"),
      );

      const haystack = [
        fio.nom,
        fio.description,
        fio.pilote,
        fio.pilier,
        fio.ville,
        fio.jour,
        categoryLabel,
        ...(fio.types ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [filteredByControls, query, t]);

  const sections = useMemo(
    () => getOrderedCategorySections(groupFiosByCategory(filtered)),
    [filtered],
  );

  return (
    <div>
      <div className="mb-10 max-w-xl">
        <label htmlFor="fio-search" className="sr-only">
          {t("searchGroups")}
        </label>
        <input
          id="fio-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchGroupsPlaceholder")}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-icc-ink shadow-sm outline-none transition placeholder:text-icc-muted focus:border-icc-coral focus:ring-2 focus:ring-icc-coral/20"
        />
        <p className="mt-2 text-sm text-icc-muted">
          {t("groupsCount", { count: filtered.length })}
        </p>
      </div>

      <FioDirectoryFilters fios={fios} onChange={handleFilterChange} />

      {sections.length === 0 ? (
        <p className="text-icc-muted">{t("noGroupsMatch")}</p>
      ) : (
        <div className="space-y-12 md:space-y-14">
          {sections.map((section) => (
            <FioCategorySection
              key={section.category}
              category={section.category}
              fios={section.fios}
            />
          ))}
        </div>
      )}
    </div>
  );
}
