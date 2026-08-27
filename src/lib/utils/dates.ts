import type { AppLocale } from "@/i18n/routing";

const localeToBcp47: Record<AppLocale, string> = {
  fr: "fr-FR",
  en: "en-GB",
  de: "de-DE",
  es: "es-ES",
};

export function formatDate(iso: string, locale: string = "fr"): string {
  const bcp47 =
    localeToBcp47[locale as AppLocale] ?? localeToBcp47.fr;
  return new Intl.DateTimeFormat(bcp47, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/** @deprecated Prefer formatDate(iso, locale) */
export function formatFrDate(iso: string): string {
  return formatDate(iso, "fr");
}
