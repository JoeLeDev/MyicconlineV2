"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { MemberCard } from "@/components/community/MemberCard";
import type { CommunityMember } from "@/lib/wp/community-types";

type Props = {
  members: CommunityMember[];
};

export function MemberDirectory({ members }: Props) {
  const t = useTranslations("community");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return members;

    return members.filter((member) => {
      const haystack = [
        member.name,
        member.username,
        member.slug,
        member.fio,
        member.primary_fio?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [members, query]);

  return (
    <div>
      <label className="mb-6 block">
        <span className="mb-1.5 block text-sm font-semibold text-icc-ink">
          {t("searchMembers")}
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchMembersPlaceholder")}
          className="w-full max-w-md border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-icc-coral"
        />
      </label>

      <p className="mb-4 text-sm text-icc-muted">
        {t("membersCount", { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <p className="text-icc-muted">{t("noMembers")}</p>
      ) : (
        <ul className="grid list-none gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((member) => (
            <li key={member.id}>
              <MemberCard member={member} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
