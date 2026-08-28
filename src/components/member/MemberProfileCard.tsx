import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { LogoutButton } from "@/components/auth/LogoutButton";
import type { AuthUser } from "@/lib/auth/types";
import { getWpMemberProfileUrl } from "@/lib/wp/community-links";

type Props = {
  member: AuthUser;
};

export async function MemberProfileCard({ member }: Props) {
  const t = await getTranslations("memberSpace");
  const profileUrl = getWpMemberProfileUrl(member.slug);

  return (
    <section
      className="rounded-xl border border-black/8 bg-icc-cream/40 p-6 md:p-8"
      aria-labelledby="member-profile-name"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          {member.avatarUrl ? (
            <Image
              src={member.avatarUrl}
              alt=""
              width={88}
              height={88}
              className="h-[5.5rem] w-[5.5rem] shrink-0 rounded-full object-cover ring-2 ring-white"
            />
          ) : (
            <div
              className="flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center rounded-full bg-icc-coral/15 text-2xl font-bold text-icc-coral ring-2 ring-white"
              aria-hidden
            >
              {member.name.slice(0, 1).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-icc-coral/12 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-icc-coral-deep">
                {t("connectedBadge")}
              </span>
            </div>
            <h2
              id="member-profile-name"
              className="text-xl font-bold tracking-tight text-icc-ink md:text-2xl"
            >
              {member.name}
            </h2>
            {member.email ? (
              <p className="mt-1 truncate text-sm text-icc-muted">{member.email}</p>
            ) : null}
            <p className="mt-1 text-sm text-icc-muted">@{member.slug}</p>
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex text-sm font-medium text-icc-coral hover:text-icc-coral-deep"
            >
              {t("viewWpProfile")}
              <span className="sr-only"> ({t("opensNewTab")})</span>
            </a>
          </div>
        </div>

        <div className="shrink-0 sm:self-start">
          <LogoutButton />
        </div>
      </div>
    </section>
  );
}
