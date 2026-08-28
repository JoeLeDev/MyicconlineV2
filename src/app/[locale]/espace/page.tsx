import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MemberProfileCard } from "@/components/member/MemberProfileCard";
import { MemberShortcutGrid } from "@/components/member/MemberShortcutGrid";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return {
    title: t("mySpace"),
    description: "ICC Online",
  };
}

export default async function EspacePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("memberSpace");
  const user = await getCurrentUser();
  if (!user) {
    redirect({
      href: { pathname: "/connexion", query: { next: "/espace" } },
      locale,
    });
  }

  const member = user!;

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="container-icc max-w-5xl">
        <header className="mb-8 md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight text-icc-ink">
            {t("pageTitle", { name: member.name })}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-icc-muted md:text-lg">
            {t("pageSubtitle")}
          </p>
        </header>

        <MemberProfileCard member={member} />

        <div className="mt-6 rounded-xl border border-icc-coral/20 bg-icc-cream/50 px-4 py-3 text-sm leading-relaxed text-icc-muted md:mt-8 md:px-5 md:py-4">
          {t("infoBanner")}
        </div>

        <div className="mt-10 md:mt-12">
          <MemberShortcutGrid />
        </div>
      </div>
    </div>
  );
}
