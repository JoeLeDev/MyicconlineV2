const BP_MYSTERY_AVATAR = "mystery-group";

export type BpGroupMeta = {
  types: string[];
  avatarFull: string;
  status?: string;
};

export function isBpDefaultAvatar(url: string): boolean {
  const normalized = url.trim();
  return !normalized || normalized.includes(BP_MYSTERY_AVATAR);
}

/** Cover BuddyPress en priorité, sinon avatar de groupe (hors placeholder BP). */
export function resolveFioImage(image: string, avatarFull?: string): string {
  const cover = image.trim();
  if (cover) return cover;

  const avatar = avatarFull?.trim() ?? "";
  if (avatar && !isBpDefaultAvatar(avatar)) return avatar;

  return "";
}

export function enrichFioImage<T extends { id: number; image: string }>(
  fio: T,
  meta?: BpGroupMeta,
): T {
  return {
    ...fio,
    image: resolveFioImage(fio.image, meta?.avatarFull),
  };
}
