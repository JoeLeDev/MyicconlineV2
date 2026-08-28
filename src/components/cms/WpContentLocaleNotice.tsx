import { getTranslations } from "next-intl/server";
import { isDefaultWpContentLocale } from "@/lib/wp/content-locale";

type Props = {
  locale: string;
  namespace: "blog" | "events" | "wpPages";
};

export async function WpContentLocaleNotice({ locale, namespace }: Props) {
  if (isDefaultWpContentLocale(locale)) return null;

  const t = await getTranslations(namespace);

  return (
    <p className="mb-6 rounded-lg border border-icc-coral/25 bg-icc-cream/60 px-4 py-3 text-sm leading-relaxed text-icc-muted">
      {t("contentInFrench")}
    </p>
  );
}
