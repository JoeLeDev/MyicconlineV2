import { wpFetch } from "./client";
import {
  CMS_PAGE_CONFIG,
  CMS_PAGE_ROUTES,
  WP_PAGES_REVALIDATE,
  WP_PAGES_TAG,
} from "./page-config";
import type { CmsPage, IccPageEmbed, WpPage } from "./types";
import { decodeHtmlEntities } from "../utils/html";

function normalizeEmbed(embed: IccPageEmbed): IccPageEmbed {
  return {
    ...embed,
    src: embed.src.trim(),
    height: embed.height?.trim() || "170vh",
  };
}

function mapFeaturedImage(
  page: WpPage,
  title: string,
): CmsPage["featuredImage"] {
  const iccUrl = page.icc_page?.featured_image?.trim();
  if (iccUrl) {
    return { url: iccUrl, alt: title };
  }

  const media = page._embedded?.["wp:featuredmedia"]?.[0];
  if (!media?.source_url || "code" in media) return undefined;

  return {
    url: media.source_url,
    alt: media.alt_text || title,
  };
}

function mapWpPage(page: WpPage): CmsPage {
  const icc = page.icc_page;
  const title = decodeHtmlEntities(page.title.rendered);

  return {
    id: page.id,
    slug: page.slug,
    title,
    modified: icc?.modified || page.modified,
    link: page.link,
    introHtml: icc?.intro_html?.trim() || "",
    contentHtml: page.content.rendered,
    featuredImage: mapFeaturedImage(page, title),
    embeds: (icc?.embeds || []).map(normalizeEmbed),
    downloads: icc?.downloads || [],
    magazine: icc?.magazine || null,
  };
}

export async function getPageBySlug(wpSlug: string): Promise<CmsPage | null> {
  const pages = await wpFetch<WpPage[]>(
    `/wp/v2/pages?slug=${encodeURIComponent(wpSlug)}&_embed=1`,
    {
      revalidate: WP_PAGES_REVALIDATE,
      tags: [WP_PAGES_TAG, `${WP_PAGES_TAG}:${wpSlug}`],
    },
  );

  const page = pages[0];
  if (!page) return null;
  return mapWpPage(page);
}

export async function getCmsPageByRoute(route: string): Promise<CmsPage | null> {
  const config = CMS_PAGE_CONFIG[route];
  if (!config) return null;
  return getPageBySlug(config.wpSlug);
}

export async function getAllCmsPagesForSitemap(): Promise<
  { path: string; modified: string }[]
> {
  const entries = await Promise.all(
    CMS_PAGE_ROUTES.map(async (route) => {
      const config = CMS_PAGE_CONFIG[route];
      const page = await getPageBySlug(config.wpSlug).catch(() => null);
      if (!page) return null;
      return { path: `/${route}`, modified: page.modified };
    }),
  );

  return entries.filter(
    (entry): entry is { path: string; modified: string } => entry !== null,
  );
}
