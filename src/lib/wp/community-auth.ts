import { getWpBaseUrl } from "./config";
import type {
  WpActivityComment,
  WpActivityListResponse,
  WpFavoriteResult,
  WpFioMembership,
  WpJoinFioResult,
} from "./community-types";

export type WpAuthResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; message: string; status: number; code?: string };

function buildWpJsonUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getWpBaseUrl()}/wp-json${normalized}`;
}

function parseWpErrorMessage(json: unknown): string {
  if (json && typeof json === "object" && "message" in json) {
    const message = (json as { message?: unknown }).message;
    if (typeof message === "string") {
      return message.replace(/<[^>]+>/g, "").trim();
    }
  }
  return "Erreur WordPress.";
}

export async function wpFetchAuth<T>(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<WpAuthResult<T>> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(buildWpJsonUrl(path), {
    ...init,
    cache: "no-store",
    headers,
  });

  const json = (await res.json().catch(() => null)) as unknown;

  if (!res.ok) {
    return {
      ok: false,
      message: parseWpErrorMessage(json),
      status: res.status,
      code:
        json && typeof json === "object" && "code" in json
          ? String((json as { code?: unknown }).code)
          : undefined,
    };
  }

  return { ok: true, data: json as T, status: res.status };
}

export async function getActivitiesAuthenticated(
  token: string,
  params?: { page?: number; perPage?: number },
): Promise<WpAuthResult<WpActivityListResponse>> {
  const page = params?.page ?? 1;
  const perPage = params?.perPage ?? 15;
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    display_comments: "0",
  });

  return wpFetchAuth<WpActivityListResponse>(
    token,
    `/myicconline/v1/activity?${query.toString()}`,
  );
}

export async function getMyFios(
  token: string,
): Promise<WpAuthResult<WpFioMembership[]>> {
  return wpFetchAuth<WpFioMembership[]>(token, "/myicconline/v1/me/fios");
}

export async function getActivityComments(
  activityId: number,
): Promise<WpActivityComment[]> {
  const url = buildWpJsonUrl(
    `/myicconline/v1/activity/${activityId}/comments`,
  );
  const res = await fetch(url, {
    next: { revalidate: 60 },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`WordPress API error ${res.status} for ${url}`);
  }

  return res.json() as Promise<WpActivityComment[]>;
}

export async function toggleActivityFavorite(
  token: string,
  activityId: number,
): Promise<WpAuthResult<WpFavoriteResult>> {
  return wpFetchAuth<WpFavoriteResult>(
    token,
    `/myicconline/v1/activity/${activityId}/favorite`,
    { method: "POST" },
  );
}

export async function postActivityComment(
  token: string,
  activityId: number,
  content: string,
): Promise<WpAuthResult<WpActivityComment>> {
  return wpFetchAuth<WpActivityComment>(
    token,
    `/myicconline/v1/activity/${activityId}/comment`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    },
  );
}

export async function joinFio(
  token: string,
  fioId: number,
): Promise<WpAuthResult<WpJoinFioResult>> {
  const payload = JSON.stringify({ fio_id: fioId });

  const primary = await wpFetchAuth<WpJoinFioResult>(
    token,
    "/myicconline/v1/join-fio",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    },
  );

  if (primary.ok || primary.status !== 404) {
    return primary;
  }

  return wpFetchAuth<WpJoinFioResult>(token, "/myicconline/v1/fio/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  });
}
