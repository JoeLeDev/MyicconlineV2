import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FioCard } from "@/components/community/FioCard";
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
    <div className="bg-white py-12 md:py-16">
      <div className="container-icc max-w-6xl">
        <header className="mb-8 md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
            {t("groupsEyebrow")}
          </p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight text-icc-ink">
            {t("groupsTitle")}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-icc-muted md:text-lg">
            {t("groupsSubtitle")}
          </p>
        </header>

        {error ? (
          <p className="rounded-lg border border-icc-coral/30 bg-icc-cream px-4 py-3 text-sm text-icc-ink">
            {error}
          </p>
        ) : null}

        {!error && fios.length === 0 ? (
          <p className="text-icc-muted">{t("emptyGroups")}</p>
        ) : null}

        <ul className="grid list-none gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {fios.map((fio) => (
            <li key={fio.id} className="h-full">
              <FioCard fio={fio} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
