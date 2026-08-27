import { getSiteUrl } from "@/lib/site-url";

/**
 * Vérifie que la requête vient bien de notre origine (anti CSRF basique).
 */
export function assertSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const site = getSiteUrl();

  let allowedHost: string;
  try {
    allowedHost = new URL(site).host;
  } catch {
    return false;
  }

  // Aussi accepter le Host de la requête (preview Vercel)
  const requestHost = request.headers.get("host");
  const allowedHosts = new Set(
    [allowedHost, requestHost].filter(Boolean) as string[],
  );

  if (origin) {
    try {
      const o = new URL(origin);
      if (allowedHosts.has(o.host)) return true;
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const r = new URL(referer);
      if (allowedHosts.has(r.host)) return true;
    } catch {
      return false;
    }
  }

  // Pas d'Origin/Referer (certains clients) → refuser les POST auth
  return false;
}
