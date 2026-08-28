import { getTranslations } from "next-intl/server";
import { FioLeaderCard } from "@/components/community/FioLeaderCard";
import { resolveLeaderProfile } from "@/lib/wp/fio-leaders";
import type { CommunityMember, WpFio, WpFioMember } from "@/lib/wp/community-types";

type Props = {
  fio: WpFio;
  membersDirectory: CommunityMember[];
  fioMembers: WpFioMember[];
};

function isPlaceholder(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return !normalized || normalized === "non défini" || normalized === "non renseigné";
}

export async function FioGroupLeaders({
  fio,
  membersDirectory,
  fioMembers,
}: Props) {
  const t = await getTranslations("community");
  const pilot = isPlaceholder(fio.pilote)
    ? null
    : resolveLeaderProfile(fio.pilote, membersDirectory, fioMembers);
  const pillar = isPlaceholder(fio.pilier)
    ? null
    : resolveLeaderProfile(fio.pilier, membersDirectory, fioMembers);

  if (!pilot && !pillar) return null;

  return (
    <section className="rounded-2xl border border-black/8 bg-white p-5 md:p-6">
      <h2 className="text-lg font-bold text-icc-ink">{t("groupLeadersTitle")}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {pilot ? (
          <FioLeaderCard roleLabel={t("groupLeaderPilot")} leader={pilot} />
        ) : null}
        {pillar ? (
          <FioLeaderCard roleLabel={t("groupLeaderPillar")} leader={pillar} />
        ) : null}
      </div>
    </section>
  );
}
