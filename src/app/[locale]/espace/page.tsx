import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/Button";
import { Link, redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getWpLoginUrl } from "@/lib/wp/config";

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
  const t = await getTranslations("auth");
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
      <div className="container-icc max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight text-icc-ink">
          {t("spaceTitle", { name: member.name })}
        </h1>
        <p className="mt-3 text-icc-muted">{t("spaceSubtitle")}</p>

        <div className="mt-10 flex flex-col gap-6 border border-black/8 bg-icc-cream/40 p-6 md:flex-row md:items-center md:p-8">
          {member.avatarUrl ? (
            <Image
              src={member.avatarUrl}
              alt=""
              width={72}
              height={72}
              className="h-[72px] w-[72px] rounded-full object-cover"
            />
          ) : (
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-icc-coral/15 text-xl font-bold text-icc-coral">
              {member.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <p className="font-semibold text-icc-ink">{member.name}</p>
            {member.email ? (
              <p className="mt-1 text-sm text-icc-muted">{member.email}</p>
            ) : null}
            <p className="mt-1 text-sm text-icc-muted">@{member.slug}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={getWpLoginUrl()} variant="primary">
            {t("openCommunity")}
          </Button>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-lg border border-icc-ink/15 bg-white px-5 py-3 text-sm font-semibold text-icc-ink transition hover:bg-icc-cream"
          >
            {t("viewBlog")}
          </Link>
        </div>
      </div>
    </div>
  );
}
