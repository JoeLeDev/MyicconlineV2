import { isBpDefaultAvatar } from "./fio-image";
import type { BpGroupMeta } from "./fio-image";

export type FioGalleryImage = {
  url: string;
  alt: string;
};

/** Galerie minimale : cover + avatar de groupe (en attendant médias BP dédiés). */
export function buildFioGallery(
  nom: string,
  coverUrl: string,
  meta?: Pick<BpGroupMeta, "avatarFull">,
): FioGalleryImage[] {
  const images: FioGalleryImage[] = [];
  const seen = new Set<string>();

  for (const candidate of [coverUrl.trim(), meta?.avatarFull?.trim() ?? ""]) {
    if (!candidate || seen.has(candidate) || isBpDefaultAvatar(candidate)) {
      continue;
    }
    seen.add(candidate);
    images.push({ url: candidate, alt: nom });
  }

  return images;
}
