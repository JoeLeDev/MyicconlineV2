import { wpFetch, wpFetchWithTotal } from "./client";
import { fetchGroupActivities } from "./group-activity";
import { getFioPrimaryCategory } from "./fio-categories";
import { enrichFioImage, type BpGroupMeta } from "./fio-image";
import { normalizeWpFioText } from "@/lib/utils/community-text";
import type {
  CommunityMember,
  CommunityMemberProfile,
  WpActivityListResponse,
  WpFio,
  WpFioMember,
  WpMemberProfile,
  WpMemberSummary,
} from "./community-types";

export const COMMUNITY_REVALIDATE = 120;
export const COMMUNITY_TAG = "community";

function normalizeFio(fio: WpFio, meta?: BpGroupMeta): WpFio {
  const enriched = normalizeWpFioText(enrichFioImage(fio, meta));
  return {
    ...enriched,
    status: meta?.status || enriched.status,
    avatar: meta?.avatarFull || enriched.avatar,
  };
}

function stripSensitiveMember(member: WpMemberSummary): CommunityMember {
  const { email: _email, ...rest } = member;
  return rest;
}

function stripSensitiveProfile(
  member: WpMemberProfile,
): CommunityMemberProfile {
  const { email: _email, phone, ...rest } = member;
  return {
    ...rest,
    phone: phone?.trim() || undefined,
  };
}

export async function getActivities(params?: {
  page?: number;
  perPage?: number;
}): Promise<WpActivityListResponse> {
  const page = params?.page ?? 1;
  const perPage = params?.perPage ?? 15;
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    display_comments: "0",
  });

  return wpFetch<WpActivityListResponse>(
    `/myicconline/v1/activity?${query.toString()}`,
    {
      revalidate: COMMUNITY_REVALIDATE,
      tags: [COMMUNITY_TAG, `${COMMUNITY_TAG}:activity`],
    },
  );
}

export async function getMembers(): Promise<CommunityMember[]> {
  const members = await wpFetch<WpMemberSummary[]>(
    "/myicconline/v1/members",
    {
      revalidate: COMMUNITY_REVALIDATE,
      tags: [COMMUNITY_TAG, `${COMMUNITY_TAG}:members`],
    },
  );

  return members.map(stripSensitiveMember);
}

export async function getMemberBySlug(
  slug: string,
): Promise<CommunityMemberProfile | null> {
  try {
    const member = await wpFetch<WpMemberProfile>(
      `/myicconline/v1/member/${encodeURIComponent(slug)}`,
      {
        revalidate: COMMUNITY_REVALIDATE,
        tags: [COMMUNITY_TAG, `${COMMUNITY_TAG}:member:${slug}`],
      },
    );
    return stripSensitiveProfile(member);
  } catch {
    return null;
  }
}

export async function getFios(): Promise<WpFio[]> {
  const [fios, metaMap] = await Promise.all([
    wpFetch<WpFio[]>("/myicconline/v1/fios", {
      revalidate: COMMUNITY_REVALIDATE,
      tags: [COMMUNITY_TAG, `${COMMUNITY_TAG}:fios`],
    }),
    fetchBpGroupMetaMap().catch(() => new Map<number, BpGroupMeta>()),
  ]);

  return fios.map((fio) => {
    const meta = metaMap.get(fio.id);
    const types = meta?.types ?? ["fio"];
    return normalizeFio(
      {
        ...fio,
        types,
        category: getFioPrimaryCategory(types),
      },
      meta,
    );
  });
}

async function fetchBpGroupMetaMap(): Promise<Map<number, BpGroupMeta>> {
  const map = new Map<number, BpGroupMeta>();
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && page <= 5) {
    const result = await wpFetchWithTotal<
      Array<{
        id: number;
        types?: string[];
        status?: string;
        avatar_urls?: { full?: string };
      }>
    >(`/buddypress/v1/groups?per_page=100&page=${page}`, {
      revalidate: COMMUNITY_REVALIDATE,
      tags: [COMMUNITY_TAG, `${COMMUNITY_TAG}:bp-group-meta`],
    });

    for (const group of result.data) {
      map.set(group.id, {
        types: group.types?.length ? group.types : ["fio"],
        avatarFull: group.avatar_urls?.full?.trim() ?? "",
        status: group.status?.trim() ?? "",
      });
    }

    totalPages = result.totalPages || 1;
    page += 1;
  }

  return map;
}

export async function getFioBySlug(slug: string): Promise<WpFio | null> {
  const decodedSlug = safeDecodeURIComponent(slug);
  const slugCandidates = [...new Set([slug, decodedSlug].filter(Boolean))];

  for (const candidate of slugCandidates) {
    try {
      const fio = await wpFetch<WpFio>(
        `/myicconline/v1/fio/${encodeURIComponent(candidate)}`,
        {
          revalidate: COMMUNITY_REVALIDATE,
          tags: [COMMUNITY_TAG, `${COMMUNITY_TAG}:fio:${candidate}`],
        },
      );
      return enrichFioFromBuddyPress(fio);
    } catch {
      // Essayer le slug suivant ou le fallback liste.
    }
  }

  try {
    const fios = await getFios();
    const target = normalizeFioSlug(decodedSlug);
    return (
      fios.find((fio) => normalizeFioSlug(fio.slug) === target) ?? null
    );
  } catch {
    return null;
  }
}

async function enrichFioFromBuddyPress(fio: WpFio): Promise<WpFio> {
  try {
    const groups = await wpFetch<
      Array<{
        types?: string[];
        status?: string;
        avatar_urls?: { full?: string };
      }>
    >(`/buddypress/v1/groups/${fio.id}`, {
      revalidate: COMMUNITY_REVALIDATE,
      tags: [COMMUNITY_TAG, `${COMMUNITY_TAG}:bp-group:${fio.id}`],
    });
    const group = groups[0];
    if (!group) return normalizeFio(fio);

    const meta: BpGroupMeta = {
      types: group.types?.length ? group.types : ["fio"],
      avatarFull: group.avatar_urls?.full?.trim() ?? "",
      status: group.status?.trim() ?? "",
    };

    return normalizeFio(
      {
        ...fio,
        types: meta.types,
        category: getFioPrimaryCategory(meta.types),
      },
      meta,
    );
  } catch {
    return normalizeFio(fio);
  }
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeFioSlug(slug: string): string {
  return safeDecodeURIComponent(slug).trim().toLowerCase();
}

export async function getFioActivities(
  fioId: number,
  params?: { page?: number; perPage?: number },
): Promise<WpActivityListResponse> {
  return fetchGroupActivities({
    fioId,
    page: params?.page,
    perPage: params?.perPage,
    revalidate: COMMUNITY_REVALIDATE,
    tags: [COMMUNITY_TAG, `${COMMUNITY_TAG}:fio-activity:${fioId}`],
  });
}

export async function getFioMembers(fioId: number): Promise<WpFioMember[]> {
  return wpFetch<WpFioMember[]>(
    `/myicconline/v1/fio/${fioId}/members`,
    {
      revalidate: COMMUNITY_REVALIDATE,
      tags: [COMMUNITY_TAG, `${COMMUNITY_TAG}:fio-members:${fioId}`],
    },
  );
}

export function buildMemberSlugIndex(
  members: CommunityMember[],
): Map<number, string> {
  return new Map(members.map((member) => [member.id, member.slug]));
}
