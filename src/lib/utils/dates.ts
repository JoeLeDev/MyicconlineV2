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

function parseWpDateTime(value: string): Date | null {
  if (!value?.trim()) return null;

  const normalized = value.includes("T")
    ? value.trim()
    : value.trim().replace(" ", "T");
  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTime(value: string, locale: string): string | null {
  if (!value?.trim()) return null;

  const bcp47 =
    localeToBcp47[locale as AppLocale] ?? localeToBcp47.fr;
  const date = parseWpDateTime(`1970-01-01 ${value}`);
  if (!date) return null;

  return new Intl.DateTimeFormat(bcp47, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function extractTimePart(
  dateTime: string,
  fallback?: string,
): string | null {
  const fromDateTime = dateTime.trim().split(/\s+/)[1];
  const raw = fromDateTime || fallback?.trim();
  return raw || null;
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
  startTimeRaw?: string,
  endTimeRaw?: string,
): string {
  const start = parseWpDateTime(startDate);
  const end = parseWpDateTime(endDate);
  const bcp47 =
    localeToBcp47[locale as AppLocale] ?? localeToBcp47.fr;

  if (!start && !end) return "";

  const dateFormatter = new Intl.DateTimeFormat(bcp47, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const startTime = formatTime(
    extractTimePart(startDate, startTimeRaw) ?? "",
    locale,
  );
  const endTime = formatTime(
    extractTimePart(endDate, endTimeRaw) ?? "",
    locale,
  );

  if (start && end) {
    if (isSameDay(start, end)) {
      if (startTime && endTime) {
        return `${dateFormatter.format(start)} · ${startTime} – ${endTime}`;
      }
      return dateFormatter.format(start);
    }

    const startLabel = startTime
      ? `${dateFormatter.format(start)} ${startTime}`
      : dateFormatter.format(start);
    const endLabel = endTime
      ? `${dateFormatter.format(end)} ${endTime}`
      : dateFormatter.format(end);
    return `${startLabel} – ${endLabel}`;
  }

  const single = start ?? end!;
  const singleTime = start ? startTime : endTime;
  if (singleTime) {
    return `${dateFormatter.format(single)} · ${singleTime}`;
  }
  return dateFormatter.format(single);
}
