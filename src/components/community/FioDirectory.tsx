"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FioCategorySection } from "@/components/community/FioCategorySection";
import {
  applyFioDirectoryFilters,
  DEFAULT_FIO_DIRECTORY_FILTERS,
  FioDirectorySearchBar,
} from "@/components/community/FioDirectorySearchBar";
import {
  getOrderedCategorySections,
  groupFiosByCategory,
  type FioCategorySlug,
} from "@/lib/wp/fio-categories";
import type { WpFio } from "@/lib/wp/community-types";

type Props = {
  fios: WpFio[];
};

export function FioDirectory({ fios }: Props) {
  const t = useTranslations("community");
  const locale = useLocale();
  const [filters, setFilters] = useState(DEFAULT_FIO_DIRECTORY_FILTERS);

  const filtered = useMemo(() => {
    const translateCategory = (category: FioCategorySlug | "other") =>
      t(
        category === "other"
          ? "groupCategoryOther"
          : (`groupCategory_${category}` as "groupCategory_fio"),
      );
    return applyFioDirectoryFilters(fios, filters, locale, translateCategory);
  }, [fios, filters, locale, t]);

  const sections = useMemo(
    () => getOrderedCategorySections(groupFiosByCategory(filtered)),
    [filtered],
  );

  return (
    <div>
      <FioDirectorySearchBar
        fios={fios}
        value={filters}
        onChange={setFilters}
        resultCount={filtered.length}
      />

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
