"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FioCardClient } from "@/components/community/FioCardClient";
import type { WpFio } from "@/lib/wp/community-types";

type Props = {
  fios: WpFio[];
};

export function FioDirectory({ fios }: Props) {
  const t = useTranslations("community");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return fios;

    return fios.filter((fio) => {
      const haystack = [fio.nom, fio.description, fio.pilote, fio.ville, fio.jour]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [fios, query]);

  return (
    <div>
      <div className="mb-8 max-w-xl">
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

      {filtered.length === 0 ? (
        <p className="text-icc-muted">{t("noGroupsMatch")}</p>
      ) : (
        <ul className="grid list-none gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((fio) => (
            <li key={fio.id} className="h-full">
              <FioCardClient fio={fio} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
