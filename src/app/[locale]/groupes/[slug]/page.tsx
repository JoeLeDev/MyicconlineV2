import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FioMemberList } from "@/components/community/FioMemberList";
import { JoinFioButton } from "@/components/community/JoinFioButton";
import { CommunityText } from "@/components/community/CommunityText";
import { Link } from "@/i18n/navigation";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { communityTextExcerpt } from "@/lib/utils/community-text";
import { getAuthToken, getCurrentUser } from "@/lib/auth/session";
import { getMyFios } from "@/lib/wp/community-auth";
import {
  buildMemberSlugIndex,
  getFioBySlug,
  getFioMembers,
  getMembers,
} from "@/lib/wp/community";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export const revalidate = 120;

function isPlaceholder(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return !normalized || normalized === "non défini" || normalized === "non renseigné";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const fio = await getFioBySlug(slug).catch(() => null);
  const t = await getTranslations({ locale, namespace: "community" });

  if (!fio) {
    return { title: t("groupNotFound") };
  }

  return buildPageMetadata({
    locale,
    href: `/groupes/${slug}`,
    title: fio.nom,
    description:
      communityTextExcerpt(fio.description) ||
      t("groupProfileDescription", { name: fio.nom }),
    images: fio.image ? [fio.image] : undefined,
  });
}

export default async function GroupDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("community");

  const fio = await getFioBySlug(slug).catch(() => null);
  if (!fio) {
    notFound();
  }

  const [members, allMembers, myFiosResult] = await Promise.all([
    getFioMembers(fio.id).catch(() => []),
    getMembers().catch(() => []),
    (async () => {
      const user = await getCurrentUser();
      const token = await getAuthToken();
      if (!user || !token) return null;
      return getMyFios(token);
    })(),
  ]);
  const slugById = buildMemberSlugIndex(allMembers);
  const isMember = myFiosResult?.ok
    ? myFiosResult.data.some((membership) => membership.id === fio.id)
    : false;
  const schedule = [fio.jour, fio.horaire].filter((v) => !isPlaceholder(v)).join(" · ");

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="container-icc max-w-4xl">
        <Link
          href="/groupes"
          className="text-sm font-semibold text-icc-coral hover:text-icc-coral-deep"
        >
          {t("backToGroups")}
        </Link>

        <header className="mt-6">
          {fio.image ? (
            <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-xl bg-icc-cream">
              <Image
                src={fio.image}
                alt={fio.nom}
                fill
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
                priority
              />
            </div>
          ) : null}

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
            {t("groupsEyebrow")}
          </p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight text-icc-ink">
            {fio.nom}
          </h1>

          {fio.description ? (
            <CommunityText
              text={fio.description}
              className="prose-icc mt-4 max-w-2xl text-base leading-relaxed text-icc-muted md:text-lg [&_p:last-child]:mb-0"
            />
          ) : null}

          <dl className="mt-6 grid gap-3 text-sm text-icc-muted sm:grid-cols-2">
            {schedule ? (
              <div>
                <dt className="font-semibold text-icc-ink">{t("schedule")}</dt>
                <dd>{schedule}</dd>
              </div>
            ) : null}
            {!isPlaceholder(fio.pilote) ? (
              <div>
                <dt className="font-semibold text-icc-ink">{t("pilotLabel")}</dt>
                <dd>{fio.pilote}</dd>
              </div>
            ) : null}
            {!isPlaceholder(fio.ville || "") ? (
              <div>
                <dt className="font-semibold text-icc-ink">{t("city")}</dt>
                <dd>{fio.ville}</dd>
              </div>
            ) : null}
            <div>
              <dt className="font-semibold text-icc-ink">{t("membersLabel")}</dt>
              <dd>{t("membersCountShort", { count: fio.membres })}</dd>
            </div>
          </dl>

          {fio.zoom_link ? (
            <a
              href={fio.zoom_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-lg border border-icc-coral bg-icc-coral px-5 py-2.5 text-sm font-semibold text-white transition hover:border-icc-coral-deep hover:bg-icc-coral-deep"
            >
              {t("joinZoom")}
            </a>
          ) : null}

          <JoinFioButton
            fioId={fio.id}
            fioName={fio.nom}
            fioSlug={fio.slug}
            initialMember={isMember}
          />
        </header>

        <section className="mt-12">
          <h2 className="text-lg font-bold text-icc-ink">{t("groupMembers")}</h2>
          <div className="mt-4">
            <FioMemberList members={members} slugById={slugById} />
          </div>
        </section>
      </div>
    </div>
  );
}
