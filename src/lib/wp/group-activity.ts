import { getWpBaseUrl } from "./config";
import type { WpActivityItem, WpActivityListResponse } from "./community-types";

export type BpActivityItem = {
  id: number;
  user_id: number;
  component: string;
  type: string;
  title: string;
  content: { rendered: string };
  date: string;
  link: string;
  primary_item_id: number;
  favorited?: boolean;
  user_avatar?: { thumb: string; full: string };
};

const DEFAULT_AVATAR = { thumb: "", full: "" };

export function parseActivityUserName(title: string): string {
  const match = title.match(/<a[^>]*>([^<]+)<\/a>/i);
  return match?.[1]?.replace(/&[^;]+;/g, (entity) => {
    if (entity === "&amp;") return "&";
    if (entity === "&#039;" || entity === "&apos;") return "'";
    return entity;
  }) ?? "Membre";
}

export function mapBpActivityToWp(item: BpActivityItem): WpActivityItem {
  return {
    id: item.id,
    user_id: item.user_id,
    component: item.component,
    type: item.type,
    action: item.title,
    content: { rendered: item.content?.rendered ?? "" },
    date: item.date,
    link: item.link,
    user_name: parseActivityUserName(item.title),
    user_avatar: item.user_avatar ?? DEFAULT_AVATAR,
    comment_count: 0,
    favorite_count: 0,
    favorited: Boolean(item.favorited),
  };
}

export function filterActivitiesForGroup(
  items: BpActivityItem[],
  fioId: number,
): BpActivityItem[] {
  return items.filter((item) => item.primary_item_id === fioId);
}

type FetchGroupActivitiesOptions = {
  fioId: number;
  page?: number;
  perPage?: number;
  token?: string;
  revalidate?: number | false;
  tags?: string[];
};

export async function fetchGroupActivities(
  options: FetchGroupActivitiesOptions,
): Promise<WpActivityListResponse> {
  const page = options.page ?? 1;
  const perPage = options.perPage ?? 15;
  const needed = page * perPage;
  const matched: WpActivityItem[] = [];

  let bpPage = 1;
  let totalFromApi = 0;
  let totalPagesFromApi = 1;

  while (matched.length < needed && bpPage <= totalPagesFromApi && bpPage <= 10) {
    const query = new URLSearchParams({
      component: "groups",
      primary_item_id: String(options.fioId),
      page: String(bpPage),
      per_page: "20",
    });

    const url = `${getWpBaseUrl()}/wp-json/buddypress/v1/activity?${query.toString()}`;
    const headers: HeadersInit = { Accept: "application/json" };
    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    const res = await fetch(url, {
      next:
        options.revalidate === false
          ? { revalidate: undefined }
          : { revalidate: options.revalidate ?? 120, tags: options.tags },
      headers,
      cache: options.token ? "no-store" : undefined,
    });

    if (!res.ok) {
      throw new Error(`WordPress API error ${res.status} for ${url}`);
    }

    const batch = (await res.json()) as BpActivityItem[];
    totalFromApi = Number(res.headers.get("X-WP-Total") || batch.length);
    totalPagesFromApi = Number(res.headers.get("X-WP-TotalPages") || 1);

    for (const item of filterActivitiesForGroup(batch, options.fioId)) {
      matched.push(mapBpActivityToWp(item));
    }

    bpPage += 1;
    if (batch.length === 0) break;
  }

  const start = (page - 1) * perPage;
  const activities = matched.slice(start, start + perPage);

  return {
    activities,
    page,
    per_page: perPage,
    total: matched.length,
    has_more: matched.length > start + perPage || bpPage <= totalPagesFromApi,
  };
}
