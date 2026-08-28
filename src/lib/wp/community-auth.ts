import { getWpBaseUrl } from "./config";
import { fetchGroupActivities, mapBpActivityToWp } from "./group-activity";
import type {
  WpActivityComment,
  WpActivityItem,
  WpActivityListResponse,
  WpFavoriteResult,
  WpFioMembership,
  WpJoinFioResult,
} from "./community-types";
import type { BpActivityItem } from "./group-activity";

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

export async function getFioActivitiesAuthenticated(
  token: string,
  fioId: number,
  params?: { page?: number; perPage?: number },
): Promise<WpAuthResult<WpActivityListResponse>> {
  try {
    const data = await fetchGroupActivities({
      fioId,
      page: params?.page,
      perPage: params?.perPage,
      token,
      revalidate: false,
    });
    return { ok: true, data, status: 200 };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur WordPress.";
    return { ok: false, message, status: 502 };
  }
}

type BpGroupSummary = {
  id: number;
  name: string;
  slug: string;
  link: string;
  status?: string;
  types?: string[];
  date_created?: string;
};

function mapBpGroupToMembership(group: BpGroupSummary): WpFioMembership {
  return {
    id: group.id,
    name: group.name,
    slug: group.slug,
    link: group.link,
    status: group.status ?? "",
    type: group.types?.[0] ?? "fio",
    role_in_group: "member",
    is_admin: false,
    is_mod: false,
    date_modified: group.date_created ?? "",
  };
}

function coerceFioMembership(item: unknown): WpFioMembership | null {
  if (!item || typeof item !== "object") return null;

  const record = item as Record<string, unknown>;
  const id = Number(record.id);
  if (!Number.isFinite(id) || id <= 0) return null;

  const name = String(record.name ?? record.nom ?? "").trim();
  const slug = String(record.slug ?? record.fio_slug ?? "").trim();
  if (!name && !slug) return null;

  const types = record.types;
  const typeFromArray = Array.isArray(types) ? String(types[0] ?? "") : "";

  return {
    id,
    name,
    slug,
    link: String(record.link ?? ""),
    status: String(record.status ?? ""),
    type: String(record.type ?? (typeFromArray || "fio")),
    role_in_group: String(record.role_in_group ?? record.role ?? "member"),
    is_admin: Boolean(record.is_admin),
    is_mod: Boolean(record.is_mod),
    date_modified: String(record.date_modified ?? record.date_created ?? ""),
  };
}

export function normalizeFioMembershipList(data: unknown): WpFioMembership[] {
  if (Array.isArray(data)) {
    return data
      .map(coerceFioMembership)
      .filter((item): item is WpFioMembership => item !== null);
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of ["fios", "groups", "data"]) {
      const nested = record[key];
      if (Array.isArray(nested)) {
        return normalizeFioMembershipList(nested);
      }
    }
  }

  return [];
}

function mergeFioMemberships(
  primary: WpFioMembership[],
  secondary: WpFioMembership[],
): WpFioMembership[] {
  const merged = new Map<number, WpFioMembership>();
  for (const fio of [...primary, ...secondary]) {
    merged.set(fio.id, fio);
  }
  return [...merged.values()];
}

export type FioMembershipStatus = {
  isMember: boolean;
  isPending: boolean;
};

export async function getFioMembershipStatus(
  token: string,
  fioId: number,
  userId: number,
): Promise<WpAuthResult<FioMembershipStatus>> {
  const groupsResult = await wpFetchAuth<BpGroupSummary[]>(
    token,
    "/buddypress/v1/groups/me",
  );
  if (groupsResult.ok) {
    const groups = Array.isArray(groupsResult.data) ? groupsResult.data : [];
    if (groups.some((group) => group.id === fioId)) {
      return {
        ok: true,
        data: { isMember: true, isPending: false },
        status: 200,
      };
    }
  }

  const membersResult = await wpFetchAuth<Array<{ id: number }>>(
    token,
    `/buddypress/v1/groups/${fioId}/members?user_id=${userId}`,
  );
  if (membersResult.ok) {
    const members = Array.isArray(membersResult.data) ? membersResult.data : [];
    if (members.some((member) => member.id === userId)) {
      return {
        ok: true,
        data: { isMember: true, isPending: false },
        status: 200,
      };
    }
  }

  const requestsResult = await wpFetchAuth<Array<{ group_id?: number }>>(
    token,
    `/buddypress/v1/groups/membership-requests?user_id=${userId}&group_id=${fioId}`,
  );
  if (requestsResult.ok) {
    const requests = Array.isArray(requestsResult.data)
      ? requestsResult.data
      : [];
    if (requests.some((request) => Number(request.group_id) === fioId)) {
      return {
        ok: true,
        data: { isMember: false, isPending: true },
        status: 200,
      };
    }
  }

  const myFios = await getMyFios(token);
  if (myFios.ok && myFios.data.some((fio) => fio.id === fioId)) {
    return {
      ok: true,
      data: { isMember: true, isPending: false },
      status: 200,
    };
  }

  return {
    ok: true,
    data: { isMember: false, isPending: false },
    status: 200,
  };
}

export async function getMyFios(
  token: string,
): Promise<WpAuthResult<WpFioMembership[]>> {
  const [primary, fallback] = await Promise.all([
    wpFetchAuth<unknown>(token, "/myicconline/v1/me/fios"),
    wpFetchAuth<BpGroupSummary[]>(token, "/buddypress/v1/groups/me"),
  ]);

  const iccList = primary.ok ? normalizeFioMembershipList(primary.data) : [];
  const bpList =
    fallback.ok && Array.isArray(fallback.data)
      ? fallback.data.map(mapBpGroupToMembership)
      : [];
  const merged = mergeFioMemberships(iccList, bpList);

  if (merged.length > 0) {
    return { ok: true, data: merged, status: 200 };
  }

  if (fallback.ok) {
    return { ok: true, data: bpList, status: fallback.status };
  }

  if (primary.ok) {
    return { ok: true, data: iccList, status: primary.status };
  }

  return {
    ok: false,
    message: fallback.message || primary.message,
    status: fallback.status || primary.status,
    code: fallback.code || primary.code,
  };
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

export async function postGroupActivity(
  token: string,
  fioId: number,
  content: string,
): Promise<WpAuthResult<WpActivityItem>> {
  const result = await wpFetchAuth<BpActivityItem>(
    token,
    "/buddypress/v1/activity",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        component: "groups",
        type: "activity_update",
        primary_item_id: fioId,
      }),
    },
  );

  if (!result.ok) {
    return result;
  }

  if (result.data.primary_item_id !== fioId) {
    return {
      ok: false,
      message: "Publication hors groupe.",
      status: 502,
    };
  }

  return {
    ok: true,
    data: mapBpActivityToWp(result.data),
    status: result.status,
  };
}

export async function joinFio(
  token: string,
  fioId: number,
): Promise<WpAuthResult<WpJoinFioResult>> {
  const joinPublic = await wpFetchAuth<{ id?: number }>(
    token,
    `/buddypress/v1/groups/${fioId}/members`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context: "view" }),
    },
  );

  if (joinPublic.ok) {
    return {
      ok: true,
      data: { success: true, fio_id: fioId, status: "member" },
      status: joinPublic.status,
    };
  }

  if (
    joinPublic.code === "bp_rest_group_member_already_exists" ||
    joinPublic.code === "bp_rest_member_already_exists"
  ) {
    return {
      ok: true,
      data: { success: true, fio_id: fioId, status: "member" },
      status: 200,
    };
  }

  const shouldRequestMembership =
    joinPublic.code === "bp_rest_group_private" ||
    joinPublic.code === "bp_rest_group_requires_invitation";

  if (shouldRequestMembership) {
    const request = await wpFetchAuth<{ id?: number; message?: string }>(
      token,
      "/buddypress/v1/groups/membership-requests",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: fioId }),
      },
    );

    if (request.ok) {
      return {
        ok: true,
        data: {
          success: true,
          fio_id: fioId,
          status: "pending",
          message: request.data.message,
        },
        status: request.status,
      };
    }

    return request;
  }

  return joinPublic;
}
