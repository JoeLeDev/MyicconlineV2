import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";
import { getAllPostsForSitemap } from "@/lib/wp/posts";

function localizedUrl(base: string, locale: string, path: string): string {
  const normalized = path === "/" ? "" : path;
  if (locale === routing.defaultLocale) {
    return `${base}${normalized}`;
  }
  return `${base}/${locale}${normalized}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticPaths = [
    "",
    "/a-propos",
    "/blog",
    "/contact",
    "/mentions-legales",
    "/politique-de-confidentialite",
  ];

  const staticRoutes: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      staticPaths.map((path) => {
        const routePath = path || "/";
        return {
          url: localizedUrl(base, locale, routePath === "/" ? "/" : path),
          lastModified: new Date(),
          changeFrequency:
            path === "/blog" || path === "" ? "daily" : "monthly",
          priority: path === "" ? 1 : path === "/blog" ? 0.9 : 0.7,
          alternates: {
            languages: Object.fromEntries(
              routing.locales.map((l) => [
                l,
                localizedUrl(base, l, routePath === "/" ? "/" : path),
              ]),
            ),
          },
        };
      }),
  );

  let posts: MetadataRoute.Sitemap = [];
  try {
    const entries = await getAllPostsForSitemap();
    posts = routing.locales.flatMap((locale) =>
      entries.map((post) => ({
        url: localizedUrl(base, locale, `/blog/${post.slug}`),
        lastModified: new Date(post.modified),
        changeFrequency: "weekly" as const,
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [
              l,
              localizedUrl(base, l, `/blog/${post.slug}`),
            ]),
          ),
        },
      })),
    );
  } catch {
    posts = [];
  }

  return [...staticRoutes, ...posts];
}
