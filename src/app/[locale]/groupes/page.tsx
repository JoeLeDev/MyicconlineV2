import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EventBannerImage } from "@/components/events/EventBannerImage";
import { FioDirectory } from "@/components/community/FioDirectory";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { FIO_GROUPS_PAGE_BANNER } from "@/lib/wp/fio-assets";
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
    images: [FIO_GROUPS_PAGE_BANNER],
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
      <section className="bg-icc-ink">
        <EventBannerImage
          src={FIO_GROUPS_PAGE_BANNER}
          alt={t("groupsTitle")}
          layout="full"
          priority
          className="block h-auto w-full"
        />
        <h1 className="sr-only">{t("groupsTitle")}</h1>
        <p className="sr-only">{t("groupsHeroSubtitle")}</p>
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
