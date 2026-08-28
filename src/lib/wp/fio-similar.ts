import { getFioPrimaryCategory } from "./fio-categories";
import type { WpFio } from "./community-types";

function normalizePilier(value: string): string {
  return value.trim().toLowerCase();
}

function scoreSimilarity(current: WpFio, candidate: WpFio): number {
  if (candidate.id === current.id) return -1;

  let score = 0;
  const currentCategory =
    current.category ?? getFioPrimaryCategory(current.types);
  const candidateCategory =
    candidate.category ?? getFioPrimaryCategory(candidate.types);

  if (currentCategory === candidateCategory) score += 3;

  const currentPilier = normalizePilier(current.pilier);
  const candidatePilier = normalizePilier(candidate.pilier);
  if (currentPilier && currentPilier === candidatePilier) score += 4;

  if (
    current.jour &&
    candidate.jour &&
    current.jour.toLowerCase() === candidate.jour.toLowerCase()
  ) {
    score += 2;
  }

  if (current.zoom_link && candidate.zoom_link) score += 1;

  return score;
}

export function getSimilarFios(current: WpFio, all: WpFio[], limit = 6): WpFio[] {
  return all
    .map((fio) => ({ fio, score: scoreSimilarity(current, fio) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.fio.nom.localeCompare(b.fio.nom, "fr"))
    .slice(0, limit)
    .map((entry) => entry.fio);
}
