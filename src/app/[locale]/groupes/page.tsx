import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FioDirectory } from "@/components/community/FioDirectory";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getFios } from "@/lib/wp/community";

type Props = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 120;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "community" });
  return buildPageMetadata({
    locale,
    href: "/groupes",
    title: t("groupsTitle"),
    description: t("groupsSubtitle"),
  });
}

export default async function GroupsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("community");

  let fios: Awaited<ReturnType<typeof getFios>> = [];
  let error: string | null = null;

  try {
    fios = await getFios();
  } catch {
    error = t("error");
  }

  return (
    <div>
      <section className="bg-icc-ink text-white">
        <div className="container-icc max-w-6xl py-14 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-icc-coral-hot">
            {t("groupsEyebrow")}
          </p>
          <h1 className="mt-3 max-w-3xl text-[clamp(2.2rem,5vw,3.5rem)] font-extrabold leading-[1.05] tracking-tight">
            {t("groupsTitle")}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
            {t("groupsHeroSubtitle")}
          </p>
        </div>
      </section>

      <section className="bg-icc-cream/40 py-12 md:py-16">
        <div className="container-icc max-w-6xl">
          {error ? (
            <p className="rounded-lg border border-icc-coral/30 bg-white px-4 py-3 text-sm text-icc-ink">
              {error}
            </p>
          ) : null}

          {!error && fios.length === 0 ? (
            <p className="text-icc-muted">{t("emptyGroups")}</p>
          ) : null}

          {!error && fios.length > 0 ? <FioDirectory fios={fios} /> : null}
        </div>
      </section>
    </div>
  );
}
