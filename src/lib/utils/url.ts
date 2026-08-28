const INVALID_IMAGE_VALUES = new Set(["array", "null", "undefined", "false"]);

function encodeUrlPath(url: URL): string {
  const encodedPath = url.pathname
    .split("/")
    .map((segment) => {
      if (!segment) return segment;
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join("/");

  return `${url.origin}${encodedPath}${url.search}${url.hash}`;
}

/** Filtre les valeurs WordPress invalides (ex. la chaîne PHP `"Array"`). */
export function normalizeRemoteImageUrl(
  ...candidates: (string | null | undefined)[]
): string {
  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;

    const value = candidate.trim();
    if (!value || INVALID_IMAGE_VALUES.has(value.toLowerCase())) continue;
    if (!/^https?:\/\//i.test(value)) continue;

    try {
      return encodeUrlPath(new URL(value));
    } catch {
      continue;
    }
  }

  return "";
}
