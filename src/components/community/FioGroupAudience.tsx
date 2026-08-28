import { getTranslations } from "next-intl/server";
import { CommunityText } from "@/components/community/CommunityText";

type Props = {
  description: string;
};

export async function FioGroupAudience({ description }: Props) {
  const t = await getTranslations("community");

  return (
    <section className="rounded-2xl border border-black/8 bg-white p-5 md:p-6">
      <h2 className="text-lg font-bold text-icc-ink">{t("groupAudienceTitle")}</h2>
      <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
        {t("groupAudienceEveryone")}
      </p>
      {description ? (
        <CommunityText
          text={description}
          className="prose-icc mt-4 max-w-3xl text-sm leading-relaxed text-icc-muted md:text-base [&_p:last-child]:mb-0"
        />
      ) : null}
    </section>
  );
}
