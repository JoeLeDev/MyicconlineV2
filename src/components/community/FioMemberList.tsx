import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { WpFioMember } from "@/lib/wp/community-types";

type Props = {
  members: WpFioMember[];
  slugById?: Map<number, string>;
};

export async function FioMemberList({ members, slugById }: Props) {
  const t = await getTranslations("community");
  const slugIndex = slugById ?? new Map<number, string>();

  if (!members.length) {
    return <p className="text-icc-muted">{t("noFioMembers")}</p>;
  }

  return (
    <ul className="grid list-none gap-3 sm:grid-cols-2">
      {members.map((member) => {
        const slug = slugIndex.get(member.id);
        const inner = (
          <>
            {member.avatar ? (
              <Image
                src={member.avatar}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-icc-coral/15 text-sm font-bold text-icc-coral"
                aria-hidden
              >
                {member.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="font-medium text-icc-ink">{member.name}</span>
          </>
        );

        return (
          <li key={member.id}>
            {slug ? (
              <Link
                href={`/membres/${slug}`}
                className="flex items-center gap-3 rounded-lg border border-black/8 bg-white px-4 py-3 transition hover:border-icc-coral/30"
              >
                {inner}
              </Link>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-black/8 bg-white px-4 py-3">
                {inner}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
