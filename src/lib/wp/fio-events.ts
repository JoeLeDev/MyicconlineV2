import { getEvents } from "./events";
import type { IccEvent } from "./types";
import type { WpFio } from "./community-types";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function eventMatchesFio(event: IccEvent, fio: WpFio): boolean {
  const name = normalize(fio.nom);
  if (!name) return false;

  const haystack = [event.title, event.excerpt, event.location]
    .map(normalize)
    .join(" ");

  return haystack.includes(name);
}

export async function getRelatedEventsForFio(
  fio: WpFio,
  limit = 3,
): Promise<IccEvent[]> {
  try {
    const result = await getEvents({ scope: "upcoming", perPage: 50 });
    return result.events.filter((event) => eventMatchesFio(event, fio)).slice(0, limit);
  } catch {
    return [];
  }
}
