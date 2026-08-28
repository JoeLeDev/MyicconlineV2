"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { MemberCard } from "@/components/community/MemberCard";
import { Link, useRouter } from "@/i18n/navigation";
import type { CommunityMember } from "@/lib/wp/community-types";

const MEMBERS_PER_PAGE = 24;

type Props = {
  members: CommunityMember[];
};

export function MemberDirectory({ members }: Props) {
  const t = useTranslations("community");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  const pageFromUrl = Math.max(1, Number(searchParams.get("page")) || 1);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / MEMBERS_PER_PAGE));
  const page = Math.min(pageFromUrl, totalPages);
  const pageStart = (page - 1) * MEMBERS_PER_PAGE;
  const pagedMembers = filtered.slice(pageStart, pageStart + MEMBERS_PER_PAGE);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  function handleQueryChange(value: string) {
    setQuery(value);
    if (pageFromUrl > 1) {
      router.replace("/membres");
    }
  }

  return (
    <div>
      <label className="mb-6 block">
        <span className="mb-1.5 block text-sm font-semibold text-icc-ink">
          {t("searchMembers")}
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          placeholder={t("searchMembersPlaceholder")}
          className="w-full max-w-md border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-icc-coral"
        />
      </label>

      <p className="mb-4 text-sm text-icc-muted">
        {t("membersCount", { count: filtered.length })}
        {filtered.length > MEMBERS_PER_PAGE ? (
          <span className="ml-2">
            · {t("membersPageRange", {
              from: pageStart + 1,
              to: Math.min(pageStart + MEMBERS_PER_PAGE, filtered.length),
            })}
          </span>
        ) : null}
      </p>

      {filtered.length === 0 ? (
        <p className="text-icc-muted">{t("noMembers")}</p>
      ) : (
        <>
          <ul className="grid list-none gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pagedMembers.map((member) => (
              <li key={member.id}>
                <MemberCard member={member} />
              </li>
            ))}
          </ul>

          {totalPages > 1 ? (
            <nav
              className="mt-10 flex items-center justify-between border-t border-black/10 pt-6 text-sm font-semibold"
              aria-label="Pagination"
            >
              {hasPrev ? (
                <Link
                  href={
                    page === 2
                      ? "/membres"
                      : { pathname: "/membres", query: { page: String(page - 1) } }
                  }
                  className="text-icc-coral hover:text-icc-coral-deep"
                >
                  {t("prev")}
                </Link>
              ) : (
                <span />
              )}
              <span className="text-icc-muted">
                {t("pageOf", { page, total: totalPages })}
              </span>
              {hasNext ? (
                <Link
                  href={{ pathname: "/membres", query: { page: String(page + 1) } }}
                  className="text-icc-coral hover:text-icc-coral-deep"
                >
                  {t("next")}
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
