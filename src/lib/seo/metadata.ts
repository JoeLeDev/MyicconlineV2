import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { SITE_LOGO } from "@/lib/site";
import { getSiteUrl } from "@/lib/site-url";

const LOCALE_OPEN_GRAPH: Record<AppLocale, string> = {
  fr: "fr_FR",
  en: "en_GB",
  de: "de_DE",
  es: "es_ES",
};

type PageHref = Parameters<typeof getPathname>[0]["href"];

export function buildLocalizedUrl(locale: string, href: PageHref): string {
  const path = getPathname({ locale, href });
  const base = getSiteUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildLanguageAlternates(href: PageHref): Record<string, string> {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      buildLocalizedUrl(locale, href),
    ]),
  ) as Record<string, string>;

  languages["x-default"] = buildLocalizedUrl(routing.defaultLocale, href);
  return languages;
}

type BuildPageMetadataOptions = {
  locale: string;
  href: PageHref;
  title: string;
  description?: string;
  images?: string[];
  type?: "website" | "article";
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
};

export function buildPageMetadata(
  options: BuildPageMetadataOptions,
): Metadata {
  const {
    locale,
    href,
    title,
    description,
    images,
    type = "website",
    noIndex = false,
    publishedTime,
    modifiedTime,
  } = options;

  const canonical = buildLocalizedUrl(locale, href);
  const ogImages = images?.length ? images : [SITE_LOGO];
  const ogLocale =
    LOCALE_OPEN_GRAPH[locale as AppLocale] ?? LOCALE_OPEN_GRAPH.fr;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: buildLanguageAlternates(href),
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type,
      locale: ogLocale,
      url: canonical,
      title,
      description,
      siteName: "ICC Online",
      images: ogImages.map((url) => ({ url })),
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages,
    },
  };
}

export function mergePageMetadata(
  base: Metadata,
  extra: Metadata,
): Metadata {
  return {
    ...base,
    ...extra,
    openGraph: { ...base.openGraph, ...extra.openGraph },
    twitter: { ...base.twitter, ...extra.twitter },
    alternates: { ...base.alternates, ...extra.alternates },
  };
}
