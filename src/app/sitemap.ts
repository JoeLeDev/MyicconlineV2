import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { getAllPostsForSitemap } from "@/lib/wp/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/a-propos",
    "/blog",
    "/contact",
    "/mentions-legales",
    "/politique-de-confidentialite",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/blog" || path === "" ? "daily" : "monthly",
    priority: path === "" ? 1 : path === "/blog" ? 0.9 : 0.7,
  }));

  let posts: MetadataRoute.Sitemap = [];
  try {
    const entries = await getAllPostsForSitemap();
    posts = entries.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.modified),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    posts = [];
  }

  return [...staticRoutes, ...posts];
}
