import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";
import { getAllEventsForSitemap } from "@/lib/wp/events";
import { getAllCmsPagesForSitemap } from "@/lib/wp/pages";
import { getAllPostsForSitemap } from "@/lib/wp/posts";

function localizedUrl(base: string, locale: string, path: string): string {
  const normalized = path === "/" ? "" : path;
  if (locale === routing.defaultLocale) {
    return `${base}${normalized}`;
  }
  return `${base}/${locale}${normalized}`;
}

function staticRouteMeta(path: string) {
  if (path === "") {
    return { changeFrequency: "daily" as const, priority: 1 };
  }
  if (path === "/blog" || path === "/evenements") {
    return { changeFrequency: "daily" as const, priority: 0.9 };
  }
  return { changeFrequency: "monthly" as const, priority: 0.7 };
}

function buildSitemapAlternates(base: string, path: string) {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      localizedUrl(base, locale, path),
    ]),
  ) as Record<string, string>;

  languages["x-default"] = localizedUrl(base, routing.defaultLocale, path);
  return { languages };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticPaths = [
    "",
    "/a-propos",
    "/blog",
    "/evenements",
    "/contact",
    "/mentions-legales",
    "/politique-de-confidentialite",
  ];

  const staticRoutes: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      staticPaths.map((path) => {
        const routePath = path || "/";
        const meta = staticRouteMeta(path);
        return {
          url: localizedUrl(base, locale, routePath === "/" ? "/" : path),
          lastModified: new Date(),
          changeFrequency: meta.changeFrequency,
          priority: meta.priority,
          alternates: buildSitemapAlternates(
            base,
            routePath === "/" ? "/" : path,
          ),
        };
      }),
  );

  let cmsPages: MetadataRoute.Sitemap = [];
  try {
    const entries = await getAllCmsPagesForSitemap();
    cmsPages = routing.locales.flatMap((locale) =>
      entries.map((page) => ({
        url: localizedUrl(base, locale, page.path),
        lastModified: new Date(page.modified),
        changeFrequency: "weekly" as const,
        priority: 0.75,
        alternates: buildSitemapAlternates(base, page.path),
      })),
    );
  } catch {
    cmsPages = [];
  }

  let events: MetadataRoute.Sitemap = [];
  try {
    const entries = await getAllEventsForSitemap();
    events = routing.locales.flatMap((locale) =>
      entries.map((event) => ({
        url: localizedUrl(base, locale, `/evenements/${event.slug}`),
        lastModified: new Date(event.modified),
        changeFrequency: "weekly" as const,
        priority: 0.8,
        alternates: buildSitemapAlternates(base, `/evenements/${event.slug}`),
      })),
    );
  } catch {
    events = [];
  }

  let posts: MetadataRoute.Sitemap = [];
  try {
    const entries = await getAllPostsForSitemap();
    posts = routing.locales.flatMap((locale) =>
      entries.map((post) => ({
        url: localizedUrl(base, locale, `/blog/${post.slug}`),
        lastModified: new Date(post.modified),
        changeFrequency: "weekly" as const,
        priority: 0.8,
        alternates: buildSitemapAlternates(base, `/blog/${post.slug}`),
      })),
    );
  } catch {
    posts = [];
  }

  return [...staticRoutes, ...cmsPages, ...events, ...posts];
}
