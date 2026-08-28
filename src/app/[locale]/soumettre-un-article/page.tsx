import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SubmitArticleForm } from "@/components/articles/SubmitArticleForm";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getArticleCategories } from "@/lib/wp/article-categories";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "submitArticle" });
  return buildPageMetadata({
    locale,
    href: "/soumettre-un-article",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function SubmitArticlePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("submitArticle");
  const user = await getCurrentUser();

  if (!user) {
    redirect({
      href: { pathname: "/connexion", query: { next: "/soumettre-un-article" } },
      locale,
    });
  }

  const categories = await getArticleCategories().catch(() => []);

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="container-icc grid max-w-5xl gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight text-icc-ink">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-icc-muted md:text-lg">
            {t("subtitle")}
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-icc-muted">
            {t("helpText")}
          </p>
        </div>

        <SubmitArticleForm categories={categories} memberName={user!.name} />
      </div>
    </div>
  );
}
