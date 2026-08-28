import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MemberDirectory } from "@/components/community/MemberDirectory";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getMembers } from "@/lib/wp/community";

type Props = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 120;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "community" });
  return buildPageMetadata({
    locale,
    href: "/membres",
    title: t("membersTitle"),
    description: t("membersSubtitle"),
  });
}

export default async function MembersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("community");

  let members: Awaited<ReturnType<typeof getMembers>> = [];
  let error: string | null = null;

  try {
    members = await getMembers();
  } catch {
    error = t("error");
  }

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="container-icc max-w-5xl">
        <header className="mb-8 md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
            {t("membersEyebrow")}
          </p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight text-icc-ink">
            {t("membersTitle")}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-icc-muted md:text-lg">
            {t("membersSubtitle")}
          </p>
        </header>

        {error ? (
          <p className="rounded-lg border border-icc-coral/30 bg-icc-cream px-4 py-3 text-sm text-icc-ink">
            {error}
          </p>
        ) : (
          <MemberDirectory members={members} />
        )}
      </div>
    </div>
  );
}
