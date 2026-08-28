import { routing } from "@/i18n/routing";

/** Le contenu éditorial WordPress est rédigé en français (pas de Polylang côté WP). */
export function isDefaultWpContentLocale(locale: string): boolean {
  return locale === routing.defaultLocale;
}
