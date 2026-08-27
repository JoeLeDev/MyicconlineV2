import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/ui/ContactForm";
import { CONTACT_EMAIL } from "@/lib/site";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="container-icc grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3.2rem)] font-extrabold tracking-tight text-icc-ink">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-icc-muted md:text-lg">
            {t("subtitle")}
          </p>
          <p className="mt-6 text-sm text-icc-muted">
            {t("emailLabel")} ·{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-icc-coral hover:text-icc-coral-deep"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-2 text-sm text-icc-muted">
            {t("community")} ·{" "}
            <a
              href="https://myicconline.com/"
              className="font-medium text-icc-coral hover:text-icc-coral-deep"
            >
              myicconline.com
            </a>
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
