import type { CommunityMember, WpFioMember } from "./community-types";

export type LeaderProfile = {
  displayName: string;
  slug?: string;
  avatar?: string;
};

function normalizePersonName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ");
}

function nameTokens(name: string): string[] {
  return normalizePersonName(name).split(" ").filter(Boolean);
}

function nameMatchScore(left: string, right: string): number {
  const a = new Set(nameTokens(left));
  const b = new Set(nameTokens(right));
  if (!a.size || !b.size) return 0;

  let score = 0;
  for (const token of a) {
    if (b.has(token)) score += 1;
  }
  return score;
}

function pickBestMember(
  label: string,
  members: CommunityMember[],
): CommunityMember | null {
  const normalized = normalizePersonName(label);
  if (!normalized) return null;

  for (const member of members) {
    if (normalizePersonName(member.name) === normalized) return member;
  }

  let best: CommunityMember | null = null;
  let bestScore = 0;
  const minScore = nameTokens(label).length === 1 ? 1 : 2;

  for (const member of members) {
    const score = nameMatchScore(label, member.name);
    if (score >= minScore && score > bestScore) {
      best = member;
      bestScore = score;
    }
  }

  return best;
}

function pickBestFioMember(
  label: string,
  fioMembers: WpFioMember[],
): WpFioMember | null {
  let best: WpFioMember | null = null;
  let bestScore = 0;
  const minScore = nameTokens(label).length === 1 ? 1 : 2;

  for (const member of fioMembers) {
    const score = nameMatchScore(label, member.name);
    if (score >= minScore && score > bestScore) {
      best = member;
      bestScore = score;
    }
  }

  return best;
}

/** Associe pilote/pilier (texte libre WP) à un profil membre quand possible. */
export function resolveLeaderProfile(
  label: string,
  members: CommunityMember[],
  fioMembers: WpFioMember[],
): LeaderProfile | null {
  const displayName = label.trim();
  if (!displayName) return null;

  const member = pickBestMember(displayName, members);
  if (member) {
    return {
      displayName: member.name,
      slug: member.slug,
      avatar: member.avatar || undefined,
    };
  }

  const fioMember = pickBestFioMember(displayName, fioMembers);
  if (fioMember) {
    return {
      displayName: fioMember.name,
      avatar: fioMember.avatar || undefined,
    };
  }

  return { displayName };
}
