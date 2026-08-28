import { getTranslations } from "next-intl/server";
import { CommunityText } from "@/components/community/CommunityText";
import { communityTextExcerpt } from "@/lib/utils/community-text";

type Props = {
  description: string;
  pilotName?: string;
  schedule?: string;
};

export async function FioGroupWelcome({
  description,
  pilotName,
  schedule,
}: Props) {
  const t = await getTranslations("community");
  const excerpt = communityTextExcerpt(description, 280);

  if (!excerpt && !schedule) return null;

  return (
    <div className="rounded-2xl border border-icc-coral/20 bg-gradient-to-br from-icc-coral/10 to-white px-5 py-4 md:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-icc-coral">
        {t("groupWelcomeTitle")}
      </p>
      {pilotName ? (
        <p className="mt-2 text-sm font-semibold text-icc-ink">
          {t("groupWelcomeFrom", { name: pilotName })}
        </p>
      ) : null}
      {schedule ? (
        <p className="mt-1 text-sm text-icc-muted">{t("groupWelcomeSchedule", { schedule })}</p>
      ) : null}
      {excerpt ? (
        <CommunityText
          text={excerpt}
          className="prose-icc mt-3 text-sm leading-relaxed text-icc-muted [&_p:last-child]:mb-0"
        />
      ) : null}
    </div>
  );
}
