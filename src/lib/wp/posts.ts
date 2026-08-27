import { wpFetch, wpFetchWithTotal } from "./client";
import {
  decodeHtmlEntities,
  extractYoutubeUrlFromHtml,
  stripBrokenPdfImages,
  stripHtml,
  stripYoutubeEmbeds,
} from "../utils/html";
import { estimateReadingTimeMinutes } from "../utils/reading-time";
import type {
  BlogAttachment,
  BlogPost,
  IccEditorial,
  IccEditorialFile,
  WpMedia,
  WpPost,
  WpTerm,
} from "./types";

type MapOptions = {
  /** Résoudre les PDF via meta / media API (uniquement pour la page article). */
  resolveAttachments?: boolean;
};

function getCategory(post: WpPost): BlogPost["category"] {
  const groups = post._embedded?.["wp:term"] || [];
  for (const terms of groups) {
    const category = terms.find((t: WpTerm) => t.taxonomy === "category");
    if (category) {
      return { id: category.id, name: category.name, slug: category.slug };
    }
  }
  return undefined;
}

function getAuthorName(post: WpPost): string {
  const author = post._embedded?.author?.[0];
  if (author && "name" in author && author.name) return author.name;
  return "ICC Online";
}

function getFeaturedImage(post: WpPost): BlogPost["featuredImage"] {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!media?.source_url) return undefined;

  // Erreur REST (ex. média privé) → pas d'image
  if ("code" in media) return undefined;

  const sizes = media.media_details?.sizes;
  const preferred =
    sizes?.medium_large?.source_url ||
    sizes?.large?.source_url ||
    sizes?.medium?.source_url;

  return {
    url: preferred || media.source_url,
    alt: media.alt_text || decodeHtmlEntities(post.title.rendered),
    width: media.media_details?.width,
    height: media.media_details?.height,
  };
}

function parseAttachedFileIds(meta: WpPost["meta"]): number[] {
  if (!meta) return [];
  const raw = meta._myicc_attached_files;
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n) && n > 0);
  }
  if (typeof raw === "string") {
    return raw
      .split(/[,\s]+/)
      .map((v) => Number(v.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
  }
  return [];
}

function getYoutubeFromMeta(meta: WpPost["meta"]): string | undefined {
  if (!meta) return undefined;
  const url =
    (typeof meta._myicc_youtube_url === "string" && meta._myicc_youtube_url) ||
    (typeof meta.usp_youtube_url === "string" && meta.usp_youtube_url) ||
    undefined;
  return url?.trim() || undefined;
}

function getYoutubeFromEditorial(
  editorial: IccEditorial | null | undefined,
): string | undefined {
  if (!editorial) return undefined;
  const url = editorial.youtube_url?.trim();
  if (url) return url;
  const id = editorial.youtube_id?.trim();
  if (id) return `https://www.youtube.com/watch?v=${id}`;
  return undefined;
}

function parseFilesize(value: number | string | undefined): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value.replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function mapEditorialFiles(files: IccEditorialFile[]): BlogAttachment[] {
  return files
    .filter((f) => Boolean(f?.url))
    .map((f, index) => {
      const extension = (f.extension || f.url.split(".").pop() || "")
        .replace(/^\./, "")
        .toLowerCase();
      return {
        id: f.id ?? index,
        title: decodeHtmlEntities(f.title || `Fichier ${index + 1}`),
        url: f.url,
        mimeType:
          f.mime_type ||
          (extension === "pdf"
            ? "application/pdf"
            : `application/${extension || "octet-stream"}`),
        extension: extension || undefined,
        filesize: parseFilesize(f.filesize),
      } satisfies BlogAttachment;
    });
}

function formatReadingTimeLabel(
  editorial: IccEditorial | null | undefined,
  contentHtml: string,
): { label: string; minutes: number } {
  const raw = editorial?.reading_time;
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    const minutes = Math.round(raw);
    return { label: `${minutes} min de lecture`, minutes };
  }
  if (typeof raw === "string" && raw.trim()) {
    const label = raw.trim();
    const match = label.match(/(\d+)/);
    const minutes = match
      ? Number(match[1])
      : estimateReadingTimeMinutes(contentHtml);
    return { label, minutes: Math.max(1, minutes) };
  }
  const minutes = estimateReadingTimeMinutes(contentHtml);
  return { label: `${minutes} min de lecture`, minutes };
}

async function fetchAttachmentsByIds(ids: number[]): Promise<BlogAttachment[]> {
  if (!ids.length) return [];
  const unique = [...new Set(ids)];
  const results = await Promise.all(
    unique.map(async (id): Promise<BlogAttachment | null> => {
      try {
        const media = await wpFetch<WpMedia>(`/wp/v2/media/${id}`, {
          revalidate: 600,
          tags: ["wp-media"],
        });
        const extension = media.source_url.split(".").pop()?.toLowerCase();
        return {
          id: media.id,
          title: decodeHtmlEntities(media.title?.rendered || `Fichier ${id}`),
          url: media.source_url,
          mimeType: media.mime_type || "application/octet-stream",
          ...(extension ? { extension } : {}),
        };
      } catch {
        return null;
      }
    }),
  );
  return results.filter((a): a is BlogAttachment => a !== null);
}

async function fetchPdfAttachmentsForPost(
  postId: number,
): Promise<BlogAttachment[]> {
  try {
    const media = await wpFetch<WpMedia[]>(
      `/wp/v2/media?parent=${postId}&per_page=20&media_type=file`,
      { revalidate: 600, tags: ["wp-media"] },
    );
    return media
      .filter(
        (m) =>
          m.mime_type?.includes("pdf") ||
          m.source_url?.toLowerCase().endsWith(".pdf"),
      )
      .map((m) => ({
        id: m.id,
        title: decodeHtmlEntities(m.title?.rendered || "Document PDF"),
        url: m.source_url,
        mimeType: m.mime_type || "application/pdf",
        extension: "pdf",
      }));
  } catch {
    return [];
  }
}

async function resolveAttachments(
  post: WpPost,
  contentHtml: string,
): Promise<BlogAttachment[]> {
  const editorial = post.icc_editorial;
  const editorialFiles = editorial?.files;

  // Si WP expose déjà `files` (même vide), on s'y fie — pas d'appel media.
  if (Array.isArray(editorialFiles)) {
    return mapEditorialFiles(editorialFiles);
  }

  const metaIds = parseAttachedFileIds(post.meta);
  if (metaIds.length > 0) {
    return fetchAttachmentsByIds(metaIds);
  }

  const fromParent = await fetchPdfAttachmentsForPost(post.id);
  const pdfUrls = [
    ...contentHtml.matchAll(/href=["']([^"']+\.pdf[^"']*)["']/gi),
  ].map((m) => m[1]);

  const attachments = [...fromParent];
  for (const url of pdfUrls) {
    if (!attachments.some((a) => a.url === url)) {
      attachments.push({
        id: 0,
        title: decodeHtmlEntities(url.split("/").pop() || "Document PDF"),
        url,
        mimeType: "application/pdf",
        extension: "pdf",
      });
    }
  }
  return attachments;
}

export async function mapWpPostToBlogPost(
  post: WpPost,
  options: MapOptions = {},
): Promise<BlogPost> {
  const { resolveAttachments: shouldResolveAttachments = true } = options;
  const editorial = post.icc_editorial;

  const youtubeUrl =
    getYoutubeFromEditorial(editorial) ||
    getYoutubeFromMeta(post.meta) ||
    (shouldResolveAttachments
      ? extractYoutubeUrlFromHtml(post.content.rendered)
      : undefined);

  let contentHtml = shouldResolveAttachments
    ? stripBrokenPdfImages(post.content.rendered)
    : "";
  if (shouldResolveAttachments && youtubeUrl) {
    contentHtml = stripYoutubeEmbeds(contentHtml);
  }

  const attachments = shouldResolveAttachments
    ? await resolveAttachments(post, contentHtml)
    : Array.isArray(editorial?.files)
      ? mapEditorialFiles(editorial.files)
      : [];

  const { label: readingTimeLabel, minutes: readingTimeMinutes } =
    formatReadingTimeLabel(editorial, post.content?.rendered || "");

  return {
    id: post.id,
    slug: post.slug,
    title: decodeHtmlEntities(post.title.rendered),
    excerpt: stripHtml(post.excerpt.rendered),
    contentHtml,
    date: post.date,
    modified: post.modified,
    link: post.link,
    authorName: getAuthorName(post),
    category: getCategory(post),
    featuredImage: getFeaturedImage(post),
    youtubeUrl,
    attachments,
    readingTimeLabel,
    readingTimeMinutes,
  };
}

export async function getPosts(params?: {
  page?: number;
  perPage?: number;
  category?: number;
}): Promise<{ posts: BlogPost[]; total: number; totalPages: number }> {
  const page = params?.page ?? 1;
  const perPage = params?.perPage ?? 12;
  const search = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    _embed: "1",
    orderby: "date",
    order: "desc",
  });
  if (params?.category) {
    search.set("categories", String(params.category));
  }

  const { data, total, totalPages } = await wpFetchWithTotal<WpPost[]>(
    `/wp/v2/posts?${search.toString()}`,
    { revalidate: 120, tags: ["wp-posts"] },
  );

  // Liste : 1 seul appel WP, sans N requêtes media pour les PDF
  const posts = await Promise.all(
    data.map((post) =>
      mapWpPostToBlogPost(post, { resolveAttachments: false }),
    ),
  );
  return { posts, total, totalPages };
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await wpFetch<WpPost[]>(
    `/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1`,
    { revalidate: 120, tags: ["wp-posts", `wp-post-${slug}`] },
  );
  if (!posts.length) return null;
  return mapWpPostToBlogPost(posts[0], { resolveAttachments: true });
}

export async function getRelatedPosts(
  post: BlogPost,
  limit = 3,
): Promise<BlogPost[]> {
  const search = new URLSearchParams({
    per_page: String(limit + 2),
    _embed: "1",
    exclude: String(post.id),
    orderby: "date",
    order: "desc",
  });
  if (post.category?.id) {
    search.set("categories", String(post.category.id));
  }

  const data = await wpFetch<WpPost[]>(`/wp/v2/posts?${search.toString()}`, {
    revalidate: 300,
    tags: ["wp-posts"],
  });

  const mapped = await Promise.all(
    data.map((p) => mapWpPostToBlogPost(p, { resolveAttachments: false })),
  );
  return mapped.filter((p) => p.id !== post.id).slice(0, limit);
}

export async function getAllPostSlugs(): Promise<string[]> {
  const entries = await getAllPostsForSitemap();
  return entries.map((e) => e.slug);
}

export async function getAllPostsForSitemap(): Promise<
  Array<{ slug: string; modified: string }>
> {
  const entries: Array<{ slug: string; modified: string }> = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && page <= 20) {
    const { data, totalPages: pages } = await wpFetchWithTotal<
      Array<{ slug: string; modified: string }>
    >(
      `/wp/v2/posts?per_page=100&page=${page}&_fields=slug,modified`,
      { revalidate: 600, tags: ["wp-posts"] },
    );
    totalPages = pages || 1;
    for (const post of data) {
      if (post.slug) {
        entries.push({
          slug: post.slug,
          modified: post.modified || new Date().toISOString(),
        });
      }
    }
    page += 1;
  }

  return entries;
}
