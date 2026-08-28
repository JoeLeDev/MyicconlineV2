import { wpFetch } from "./client";
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
  return wpFetch<WpFio[]>("/myicconline/v1/fios", {
    revalidate: COMMUNITY_REVALIDATE,
    tags: [COMMUNITY_TAG, `${COMMUNITY_TAG}:fios`],
  });
}

export async function getFioBySlug(slug: string): Promise<WpFio | null> {
  const decodedSlug = safeDecodeURIComponent(slug);
  const slugCandidates = [...new Set([slug, decodedSlug].filter(Boolean))];

  for (const candidate of slugCandidates) {
    try {
      return await wpFetch<WpFio>(
        `/myicconline/v1/fio/${encodeURIComponent(candidate)}`,
        {
          revalidate: COMMUNITY_REVALIDATE,
          tags: [COMMUNITY_TAG, `${COMMUNITY_TAG}:fio:${candidate}`],
        },
      );
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
  const page = params?.page ?? 1;
  const perPage = params?.perPage ?? 15;
  const query = new URLSearchParams({
    group_id: String(fioId),
    page: String(page),
    per_page: String(perPage),
    display_comments: "0",
  });

  return wpFetch<WpActivityListResponse>(
    `/myicconline/v1/activity?${query.toString()}`,
    {
      revalidate: COMMUNITY_REVALIDATE,
      tags: [COMMUNITY_TAG, `${COMMUNITY_TAG}:fio-activity:${fioId}`],
    },
  );
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
