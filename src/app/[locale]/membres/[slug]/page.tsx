import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CommunityText } from "@/components/community/CommunityText";
import { Link } from "@/i18n/navigation";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { communityTextExcerpt } from "@/lib/utils/community-text";
import { getMemberBySlug } from "@/lib/wp/community";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export const revalidate = 120;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const member = await getMemberBySlug(slug).catch(() => null);
  const t = await getTranslations({ locale, namespace: "community" });

  if (!member) {
    return { title: t("memberNotFound") };
  }

  return buildPageMetadata({
    locale,
    href: `/membres/${slug}`,
    title: member.name,
    description:
      communityTextExcerpt(member.bio) ||
      t("memberProfileDescription", { name: member.name }),
    images: member.avatar ? [member.avatar] : undefined,
  });
}

export default async function MemberProfilePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("community");
  const member = await getMemberBySlug(slug).catch(() => null);

  if (!member) {
    notFound();
  }

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="container-icc max-w-3xl">
        <Link
          href="/membres"
          className="text-sm font-semibold text-icc-coral hover:text-icc-coral-deep"
        >
          {t("backToMembers")}
        </Link>

        <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          {member.avatar ? (
            <Image
              src={member.avatar}
              alt=""
              width={112}
              height={112}
              className="h-28 w-28 rounded-full object-cover ring-4 ring-icc-cream"
            />
          ) : (
            <div
              className="flex h-28 w-28 items-center justify-center rounded-full bg-icc-coral/15 text-3xl font-bold text-icc-coral ring-4 ring-icc-cream"
              aria-hidden
            >
              {member.name.slice(0, 1).toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold tracking-tight text-icc-ink">
              {member.name}
            </h1>
            <p className="mt-1 text-icc-muted">@{member.slug}</p>
            {member.role ? (
              <p className="mt-2 text-sm font-medium text-icc-coral">{member.role}</p>
            ) : null}
            {member.ville ? (
              <p className="mt-1 text-sm text-icc-muted">{member.ville}</p>
            ) : null}
          </div>
        </header>

        {member.bio ? (
          <CommunityText
            text={member.bio}
            className="prose-icc mt-8 text-base leading-relaxed text-icc-ink"
          />
        ) : null}

        {member.fios.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-lg font-bold text-icc-ink">{t("memberFios")}</h2>
            <ul className="mt-4 space-y-2">
              {member.fios.map((fio) => (
                <li key={fio.id}>
                  <Link
                    href={`/groupes/${fio.slug}`}
                    className="inline-flex items-center gap-2 font-medium text-icc-coral hover:text-icc-coral-deep"
                  >
                    {fio.name}
                    {fio.role_in_group ? (
                      <span className="text-sm font-normal text-icc-muted">
                        · {fio.role_in_group}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
