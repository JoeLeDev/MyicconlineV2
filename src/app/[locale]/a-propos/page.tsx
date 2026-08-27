import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/Button";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("title"),
    description: t("p1"),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="container-icc max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-[clamp(2rem,5vw,3.2rem)] font-extrabold tracking-tight text-icc-ink">
          {t("title")}
        </h1>

        <div className="mt-8 space-y-5 text-base leading-relaxed text-icc-muted md:text-lg">
          <p>{t("p1")}</p>
          <p>{t("p2")}</p>
          <p>
            {t("p3Before")}{" "}
            <strong className="font-semibold text-icc-ink">{t("p3Strong")}</strong>{" "}
            {t("p3After")}
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/connexion" variant="primary">
            {t("ctaLogin")}
          </Button>
          <Button href="/contact" variant="ghost">
            {t("ctaContact")}
          </Button>
        </div>
      </div>
    </div>
  );
}
