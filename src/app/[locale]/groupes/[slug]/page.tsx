import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FioGroupAudience } from "@/components/community/FioGroupAudience";
import { FioGroupEventsSection } from "@/components/community/FioGroupEventsSection";
import { FioGroupFeed } from "@/components/community/FioGroupFeed";
import { FioGroupGallery } from "@/components/community/FioGroupGallery";
import { FioGroupHero } from "@/components/community/FioGroupHero";
import { FioGroupLeaders } from "@/components/community/FioGroupLeaders";
import { FioGroupMap } from "@/components/community/FioGroupMap";
import { FioGroupNotificationBanner } from "@/components/community/FioGroupNotifications";
import { FioGroupPostForm } from "@/components/community/FioGroupPostForm";
import { FioGroupSidebar } from "@/components/community/FioGroupSidebar";
import { FioGroupTabs } from "@/components/community/FioGroupTabs";
import { FioGroupWelcome } from "@/components/community/FioGroupWelcome";
import { FioMemberList } from "@/components/community/FioMemberList";
import { FioSimilarGroups } from "@/components/community/FioSimilarGroups";
import { CommunityText } from "@/components/community/CommunityText";
import { Link } from "@/i18n/navigation";
import { peekAuthToken } from "@/lib/auth/session";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { communityTextExcerpt } from "@/lib/utils/community-text";
import { getFioActivitiesAuthenticated } from "@/lib/wp/community-auth";
import {
  buildMemberSlugIndex,
  getFioActivities,
  getFioBySlug,
  getFioMembers,
  getFios,
  getMembers,
} from "@/lib/wp/community";
import { getRelatedEventsForFio } from "@/lib/wp/fio-events";
import { buildFioGallery } from "@/lib/wp/fio-gallery";
import { getSimilarFios } from "@/lib/wp/fio-similar";

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

  const [members, allFios, membersDirectory, token, relatedEvents] =
    await Promise.all([
      getFioMembers(fio.id).catch(() => []),
      getFios().catch(() => []),
      getMembers().catch(() => []),
      peekAuthToken(),
      getRelatedEventsForFio(fio).catch(() => []),
    ]);

  const slugById = buildMemberSlugIndex(membersDirectory);
  const similarFios = getSimilarFios(fio, allFios);
  const galleryImages = buildFioGallery(fio.nom, fio.image, {
    avatarFull: fio.avatar ?? "",
  });

  const activityResponse = token
    ? await getFioActivitiesAuthenticated(token, fio.id).catch(() => null)
    : null;

  const activityPayload =
    activityResponse?.ok === true
      ? activityResponse.data
      : await getFioActivities(fio.id, { page: 1, perPage: 15 }).catch(() => null);

  const activities = activityPayload?.activities ?? [];
  const hasMore = Boolean(activityPayload?.has_more);
  const latestActivityId = activities[0]?.id ?? null;

  const schedule = [fio.jour, fio.horaire].filter((v) => !isPlaceholder(v)).join(" · ");
  const mapLabel = [fio.ville, fio.nom].filter(Boolean).join(" · ");

  const feedPanel = (
    <div className="space-y-4">
      <FioGroupNotificationBanner
        fioId={fio.id}
        latestActivityId={latestActivityId}
        enabled={Boolean(token)}
      />
      <FioGroupWelcome
        description={fio.description}
        pilotName={isPlaceholder(fio.pilote) ? undefined : fio.pilote}
        schedule={schedule || undefined}
      />
      <FioGroupPostForm fioId={fio.id} fioSlug={fio.slug} />
      <FioGroupFeed
        fioId={fio.id}
        locale={locale}
        initialActivities={activities}
        initialHasMore={hasMore}
        initialPage={activityPayload?.page ?? 1}
      />
    </div>
  );

  const membersPanel = (
    <div className="rounded-2xl border border-black/8 bg-white p-4 md:p-6">
      <FioMemberList members={members} slugById={slugById} />
    </div>
  );

  const aboutPanel = (
    <div className="space-y-6">
      <FioGroupAudience description={fio.description} />
      <FioGroupLeaders
        fio={fio}
        membersDirectory={membersDirectory}
        fioMembers={members}
      />
      <FioGroupGallery images={galleryImages} />
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
          {!isPlaceholder(fio.ville || "") ? (
            <div>
              <dt className="font-semibold text-icc-ink">{t("city")}</dt>
              <dd className="mt-1 text-icc-muted">{fio.ville}</dd>
            </div>
          ) : null}
        </dl>
      </div>
      {fio.lat && fio.lng ? (
        <FioGroupMap lat={fio.lat} lng={fio.lng} label={mapLabel} />
      ) : null}
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

      <div className="container-icc max-w-6xl py-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
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
            embedded
          />

          <FioGroupSidebar
            fio={fio}
            schedule={schedule}
            locale={locale}
            notificationsEnabled={Boolean(token)}
          />
        </div>
      </div>

      <FioGroupEventsSection events={relatedEvents} locale={locale} />
      <FioSimilarGroups fios={similarFios} />

      <div className="container-icc max-w-6xl pb-12">
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
