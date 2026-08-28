import { wpFetch } from "./client";
import { decodeHtmlEntities, stripHtml } from "../utils/html";
import { normalizeRemoteImageUrl } from "../utils/url";
import type { IccEvent, WpEventApi, WpEventsListResponse } from "./types";

export const EVENTS_PAGE_WP_SLUG = "evenements-6";

/** Intro WP trop courte (ex. seul le titre « Évènements »). */
export function isMinimalEventsIntro(introHtml: string): boolean {
  const text = introHtml
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return true;
  if (text.length <= 60) return true;
  return /^évènements$/i.test(text);
}
export const WP_EVENTS_REVALIDATE = 300;
export const WP_EVENTS_TAG = "wp-events";

export type EventScope = "upcoming" | "past" | "all";

type GetEventsOptions = {
  scope?: EventScope;
  page?: number;
  perPage?: number;
  search?: string;
};

function mapEvent(raw: WpEventApi): IccEvent {
  const imageUrl = normalizeRemoteImageUrl(raw.image, raw.banner);
  const bannerUrl = normalizeRemoteImageUrl(raw.banner, raw.image);

  return {
    id: raw.id,
    slug: raw.slug,
    title: decodeHtmlEntities(raw.title),
    excerpt: stripHtml(decodeHtmlEntities(raw.excerpt)),
    contentHtml: raw.content_html,
    status: raw.status,
    isUpcoming: raw.is_upcoming,
    startDate: raw.start_date,
    endDate: raw.end_date,
    startTime: raw.start_time,
    endTime: raw.end_time,
    location: decodeHtmlEntities(raw.location),
    online: raw.online,
    imageUrl,
    bannerUrl: bannerUrl || imageUrl,
    link: raw.link,
    modified: raw.modified,
  };
}

async function enrichEventFeaturedMedia(event: IccEvent): Promise<IccEvent> {
  if (event.bannerUrl) return event;

  try {
    const listing = await wpFetch<{ featured_media?: number }>(
      `/wp/v2/event_listing/${event.id}?_fields=featured_media`,
      fetchOptions,
    );
    if (!listing.featured_media) return event;

    const media = await wpFetch<{ source_url?: string }>(
      `/wp/v2/media/${listing.featured_media}?_fields=source_url`,
      fetchOptions,
    );
    const bannerUrl = normalizeRemoteImageUrl(media.source_url);
    if (!bannerUrl) return event;

    return { ...event, imageUrl: bannerUrl, bannerUrl };
  } catch {
    return event;
  }
}

function buildEventsQuery(options: GetEventsOptions): string {
  const params = new URLSearchParams();
  params.set("scope", options.scope ?? "upcoming");
  params.set("page", String(Math.max(1, options.page ?? 1)));
  params.set("per_page", String(Math.max(1, options.perPage ?? 10)));
  if (options.search?.trim()) {
    params.set("search", options.search.trim());
  }
  return params.toString();
}

const fetchOptions = {
  revalidate: WP_EVENTS_REVALIDATE,
  tags: [WP_EVENTS_TAG],
};

export async function getEvents(options: GetEventsOptions = {}) {
  const query = buildEventsQuery(options);
  const response = await wpFetch<WpEventsListResponse>(
    `/icc/v1/events?${query}`,
    fetchOptions,
  );

  const events = await Promise.all(
    response.items.map(async (raw) =>
      enrichEventFeaturedMedia(mapEvent(raw)),
    ),
  );

  return {
    events,
    total: response.total,
    totalPages: response.total_pages || 1,
    page: response.page,
    perPage: response.per_page,
    scope: response.scope as EventScope,
  };
}

export async function getEventBySlug(slug: string): Promise<IccEvent | null> {
  try {
    const raw = await wpFetch<WpEventApi>(
      `/icc/v1/events/slug/${encodeURIComponent(slug)}`,
      {
        revalidate: WP_EVENTS_REVALIDATE,
        tags: [WP_EVENTS_TAG, `${WP_EVENTS_TAG}:${slug}`],
      },
    );
    return enrichEventFeaturedMedia(mapEvent(raw));
  } catch {
    return null;
  }
}

export async function getAllEventSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await getEvents({ scope: "all", page, perPage: 100 });
    slugs.push(...result.events.map((event) => event.slug));
    totalPages = result.totalPages;
    page += 1;
  } while (page <= totalPages);

  return slugs;
}

export async function getAllEventsForSitemap(): Promise<
  { slug: string; modified: string }[]
> {
  const entries: { slug: string; modified: string }[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await getEvents({ scope: "all", page, perPage: 100 });
    entries.push(
      ...result.events.map((event) => ({
        slug: event.slug,
        modified: event.modified,
      })),
    );
    totalPages = result.totalPages;
    page += 1;
  } while (page <= totalPages);

  return entries;
}
