import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FioCard } from "@/components/community/FioCard";
import { Link } from "@/i18n/navigation";
import { redirect } from "@/i18n/navigation";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getAuthToken, getCurrentUser } from "@/lib/auth/session";
import { getMyFios } from "@/lib/wp/community-auth";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "memberSpace" });
  return buildPageMetadata({
    locale,
    href: "/espace/mes-fios",
    title: t("myFiosTitle"),
    description: t("myFiosSubtitle"),
    noIndex: true,
  });
}

export default async function MesFiosPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("memberSpace");

  const user = await getCurrentUser();
  if (!user) {
    redirect({
      href: { pathname: "/connexion", query: { next: "/espace/mes-fios" } },
      locale,
    });
  }

  const token = await getAuthToken();
  if (!token) {
    redirect({
      href: { pathname: "/connexion", query: { next: "/espace/mes-fios" } },
      locale,
    });
  }

  const result = await getMyFios(token!);
  const fios = result.ok ? result.data : [];

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="container-icc max-w-5xl">
        <Link
          href="/espace"
          className="text-sm font-semibold text-icc-coral hover:text-icc-coral-deep"
        >
          {t("backToSpace")}
        </Link>

        <header className="mt-6 mb-8 md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight text-icc-ink">
            {t("myFiosTitle")}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-icc-muted md:text-lg">
            {t("myFiosSubtitle")}
          </p>
        </header>

        {!result.ok ? (
          <p className="rounded-lg border border-icc-coral/30 bg-icc-cream px-4 py-3 text-sm text-icc-ink">
            {t("myFiosError")}
          </p>
        ) : null}

        {result.ok && fios.length === 0 ? (
          <div className="rounded-xl border border-black/8 bg-icc-cream/40 px-6 py-10 text-center">
            <p className="text-icc-muted">{t("myFiosEmpty")}</p>
            <Link
              href="/groupes"
              className="mt-4 inline-flex rounded-lg border border-icc-coral bg-icc-coral px-5 py-2.5 text-sm font-semibold text-white transition hover:border-icc-coral-deep hover:bg-icc-coral-deep"
            >
              {t("browseGroups")}
            </Link>
          </div>
        ) : null}

        {result.ok && fios.length > 0 ? (
          <ul className="grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fios.map((fio) => (
              <li key={fio.id}>
                <FioCard
                  fio={{
                    id: fio.id,
                    nom: fio.name,
                    description: "",
                    jour: "",
                    horaire: "",
                    pilote: "",
                    pilier: "",
                    membres: 0,
                    image: "",
                    link: fio.link,
                    date_creation: fio.date_modified,
                    slug: fio.slug,
                    zoom_link: "",
                  }}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
