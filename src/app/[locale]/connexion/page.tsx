import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/auth/LoginForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("loginTitle"),
    description: t("loginSubtitle"),
  };
}

export default async function ConnexionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="container-icc grid max-w-4xl gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight text-icc-ink">
            {t("loginTitle")}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-icc-muted md:text-lg">
            {t("loginSubtitle")}
          </p>
        </div>

        <Suspense
          fallback={
            <div className="border border-black/8 bg-icc-cream/40 p-6 text-sm text-icc-muted md:p-8">
              {t("loading")}
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
