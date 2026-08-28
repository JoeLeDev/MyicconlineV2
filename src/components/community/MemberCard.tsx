"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CommunityMember } from "@/lib/wp/community-types";

type Props = {
  member: CommunityMember;
};

export function MemberCard({ member }: Props) {
  const t = useTranslations("community");
  const primaryFio = member.primary_fio?.name || member.fio;

  return (
    <Link
      href={`/membres/${member.slug}`}
      className="group flex items-center gap-4 rounded-xl border border-black/8 bg-white p-4 transition hover:border-icc-coral/30 hover:shadow-sm"
    >
      {member.avatar ? (
        <Image
          src={member.avatar}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-icc-coral/15 text-lg font-bold text-icc-coral"
          aria-hidden
        >
          {member.name.slice(0, 1).toUpperCase()}
        </div>
      )}

      <div className="min-w-0">
        <p className="truncate font-semibold text-icc-ink group-hover:text-icc-coral">
          {member.name}
        </p>
        <p className="truncate text-sm text-icc-muted">@{member.slug}</p>
        {primaryFio ? (
          <p className="mt-1 truncate text-xs text-icc-muted">
            {t("primaryFio", { name: primaryFio })}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
