import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ActivityCard } from "@/components/community/ActivityCard";
import { FioGroupHero } from "@/components/community/FioGroupHero";
import { FioGroupPostForm } from "@/components/community/FioGroupPostForm";
import { FioGroupTabs } from "@/components/community/FioGroupTabs";
import { FioMemberList } from "@/components/community/FioMemberList";
import { CommunityText } from "@/components/community/CommunityText";
import { Link } from "@/i18n/navigation";
import { peekAuthToken } from "@/lib/auth/session";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { communityTextExcerpt } from "@/lib/utils/community-text";
import { getFioActivitiesAuthenticated } from "@/lib/wp/community-auth";
import { getFioActivities, getFioBySlug, getFioMembers } from "@/lib/wp/community";

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

  const [members, token] = await Promise.all([
    getFioMembers(fio.id).catch(() => []),
    peekAuthToken(),
  ]);

  const activityResponse = token
    ? await getFioActivitiesAuthenticated(token, fio.id).catch(() => null)
    : null;

  const activities =
    activityResponse?.ok === true
      ? activityResponse.data.activities
      : (
          await getFioActivities(fio.id, { page: 1, perPage: 15 }).catch(
            () => null,
          )
        )?.activities ?? [];

  const schedule = [fio.jour, fio.horaire].filter((v) => !isPlaceholder(v)).join(" · ");

  const feedPanel = (
    <div className="space-y-4">
      <FioGroupPostForm fioId={fio.id} fioSlug={fio.slug} />

      {activities.length > 0 ? (
        <div className="rounded-2xl border border-black/8 bg-white px-4 md:px-6">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-black/8 bg-icc-cream/40 px-6 py-10 text-center">
          <p className="text-icc-muted">{t("emptyGroupFeed")}</p>
        </div>
      )}
    </div>
  );

  const membersPanel = (
    <div className="rounded-2xl border border-black/8 bg-white p-4 md:p-6">
      <FioMemberList members={members} />
    </div>
  );

  const aboutPanel = (
    <div className="rounded-2xl border border-black/8 bg-white p-6 md:p-8">
      {fio.description ? (
        <CommunityText
          text={fio.description}
          className="prose-icc max-w-3xl text-base leading-relaxed text-icc-muted md:text-lg"
        />
      ) : (
        <p className="text-icc-muted">{t("groupAboutEmpty")}</p>
      )}

      <dl className="mt-8 grid gap-4 border-t border-black/8 pt-8 text-sm sm:grid-cols-2">
        {schedule ? (
          <div>
            <dt className="font-semibold text-icc-ink">{t("schedule")}</dt>
            <dd className="mt-1 text-icc-muted">{schedule}</dd>
          </div>
        ) : null}
        {!isPlaceholder(fio.pilote) ? (
          <div>
            <dt className="font-semibold text-icc-ink">{t("pilotLabel")}</dt>
            <dd className="mt-1 text-icc-muted">{fio.pilote}</dd>
          </div>
        ) : null}
        {!isPlaceholder(fio.pilier) ? (
          <div>
            <dt className="font-semibold text-icc-ink">{t("pillarLabel")}</dt>
            <dd className="mt-1 text-icc-muted">{fio.pilier}</dd>
          </div>
        ) : null}
        {!isPlaceholder(fio.ville || "") ? (
          <div>
            <dt className="font-semibold text-icc-ink">{t("city")}</dt>
            <dd className="mt-1 text-icc-muted">{fio.ville}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );

  return (
    <div className="bg-icc-cream/30">
      <FioGroupHero
        fio={fio}
        schedule={schedule}
        backLabel={t("backToGroups")}
        eyebrow={t("groupsEyebrow")}
        pilotLabel={t("pilotLabel")}
        cityLabel={t("city")}
        membersLabel={t("membersLabel")}
        membersCount={t("membersCountShort", { count: fio.membres })}
        joinZoomLabel={t("joinZoom")}
      />

      <FioGroupTabs
        defaultTab="feed"
        tabs={[
          { id: "feed", label: t("groupTabFeed") },
          { id: "members", label: t("groupTabMembers"), badge: members.length },
          { id: "about", label: t("groupTabAbout") },
        ]}
        panels={{
          feed: feedPanel,
          members: membersPanel,
          about: aboutPanel,
        }}
      />

      <div className="container-icc max-w-5xl pb-12">
        <Link
          href="/groupes"
          className="text-sm font-semibold text-icc-coral hover:text-icc-coral-deep"
        >
          {t("backToGroups")}
        </Link>
      </div>
    </div>
  );
}
