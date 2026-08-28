const ENGLISH_WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

type WeekdayKey = (typeof ENGLISH_WEEKDAYS)[number];

const WEEKDAY_LABELS: Record<string, Record<WeekdayKey, string>> = {
  fr: {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
  },
  en: {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  },
  de: {
    monday: "Montag",
    tuesday: "Dienstag",
    wednesday: "Mittwoch",
    thursday: "Donnerstag",
    friday: "Freitag",
    saturday: "Samstag",
    sunday: "Sonntag",
  },
  es: {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
  },
};

function normalizeWeekdayKey(value: string): WeekdayKey | null {
  const key = value.trim().toLowerCase();
  return ENGLISH_WEEKDAYS.includes(key as WeekdayKey) ? (key as WeekdayKey) : null;
}

/** Traduit un jour renvoyé en anglais par l’API WordPress (Monday → Lundi). */
export function translateWeekday(value: string, locale: string = "fr"): string {
  const key = normalizeWeekdayKey(value);
  if (!key) return value.trim();

  const labels = WEEKDAY_LABELS[locale] ?? WEEKDAY_LABELS.fr;
  return labels[key];
}

export function formatFioSchedule(
  jour: string,
  horaire: string,
  locale: string = "fr",
): string {
  const parts: string[] = [];
  const day = jour.trim();
  const time = horaire.trim();

  if (day && !isFioSchedulePlaceholder(day)) {
    parts.push(translateWeekday(day, locale));
  }
  if (time && !isFioSchedulePlaceholder(time)) {
    parts.push(time);
  }

  return parts.join(" · ");
}

export function isFioSchedulePlaceholder(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return !normalized || normalized === "non défini" || normalized === "non renseigné";
}

export function sortWeekdays(values: string[]): string[] {
  const order = new Map(ENGLISH_WEEKDAYS.map((day, index) => [day, index]));

  return [...values].sort((a, b) => {
    const left = order.get(a.trim().toLowerCase() as WeekdayKey) ?? 99;
    const right = order.get(b.trim().toLowerCase() as WeekdayKey) ?? 99;
    return left - right || a.localeCompare(b, "fr");
  });
}
