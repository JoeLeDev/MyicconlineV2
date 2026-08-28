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

function parseWpDateTime(value: string): Date {
  return new Date(value.replace(" ", "T"));
}

function formatTime(value: string, locale: string): string {
  const bcp47 =
    localeToBcp47[locale as AppLocale] ?? localeToBcp47.fr;
  const date = parseWpDateTime(`1970-01-01 ${value}`);
  return new Intl.DateTimeFormat(bcp47, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Affiche la plage date/heure d’un événement WP Event Manager. */
export function formatEventSchedule(
  startDate: string,
  endDate: string,
  locale: string = "fr",
): string {
  const start = parseWpDateTime(startDate);
  const end = parseWpDateTime(endDate);
  const bcp47 =
    localeToBcp47[locale as AppLocale] ?? localeToBcp47.fr;

  const dateFormatter = new Intl.DateTimeFormat(bcp47, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const startTime = formatTime(startDate.split(" ")[1] ?? "00:00:00", locale);
  const endTime = formatTime(endDate.split(" ")[1] ?? "00:00:00", locale);

  if (isSameDay(start, end)) {
    return `${dateFormatter.format(start)} · ${startTime} – ${endTime}`;
  }

  return `${dateFormatter.format(start)} ${startTime} – ${dateFormatter.format(end)} ${endTime}`;
}
