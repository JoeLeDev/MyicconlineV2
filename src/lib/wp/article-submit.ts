import { getWpBaseUrl } from "./config";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatPostContent(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;

  return trimmed
    .split(/\n{2,}/)
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`,
    )
    .join("");
}

export function normalizeYoutubeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "youtu.be" || host === "m.youtube.com") {
      return trimmed;
    }
  } catch {
    return null;
  }

  return null;
}

export function parseTagNames(raw: string): string[] {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 10);
}

export async function uploadWpMedia(
  token: string,
  file: File,
): Promise<{ ok: true; id: number } | { ok: false; message: string }> {
  const body = new FormData();
  body.append("file", file, file.name);

  const res = await fetch(`${getWpBaseUrl()}/wp-json/wp/v2/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as
    | { id?: number; message?: string; code?: string }
    | null;

  if (!res.ok || !json?.id) {
    const message =
      json && typeof json.message === "string"
        ? json.message.replace(/<[^>]+>/g, "").trim()
        : "Échec de l’envoi du fichier.";
    return { ok: false, message };
  }

  return { ok: true, id: json.id };
}

export type CreateArticleInput = {
  title: string;
  content: string;
  categoryId: number;
  tags: string[];
  youtubeUrl: string | null;
  featuredMediaId?: number;
  attachmentIds: number[];
};

export async function createPendingArticle(
  token: string,
  input: CreateArticleInput,
): Promise<
  { ok: true; id: number; link?: string } | { ok: false; message: string; status: number }
> {
  const meta: Record<string, string | number | number[]> = {};
  if (input.youtubeUrl) {
    meta._myicc_youtube_url = input.youtubeUrl;
    meta.usp_youtube_url = input.youtubeUrl;
  }
  if (input.attachmentIds.length > 0) {
    meta._myicc_attached_files = input.attachmentIds;
  }

  const payload: Record<string, unknown> = {
    title: input.title,
    content: formatPostContent(input.content),
    status: "pending",
    categories: [input.categoryId],
  };

  if (input.tags.length > 0) {
    payload.tags = input.tags;
  }
  if (input.featuredMediaId) {
    payload.featured_media = input.featuredMediaId;
  }
  if (Object.keys(meta).length > 0) {
    payload.meta = meta;
  }

  const res = await fetch(`${getWpBaseUrl()}/wp-json/wp/v2/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as
    | { id?: number; link?: string; message?: string; code?: string }
    | null;

  if (!res.ok || !json?.id) {
    const message =
      json && typeof json.message === "string"
        ? json.message.replace(/<[^>]+>/g, "").trim()
        : "Impossible de créer l’article.";
    return { ok: false, message, status: res.status || 502 };
  }

  return { ok: true, id: json.id, link: json.link };
}
