import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/origin";
import { getClientIp, consumeRateLimit } from "@/lib/auth/rate-limit";
import { getAuthToken, getCurrentUser } from "@/lib/auth/session";
import {
  getArticleCategories,
  isAllowedCategoryId,
} from "@/lib/wp/article-categories";
import {
  createPendingArticle,
  normalizeYoutubeUrl,
  parseTagNames,
  uploadWpMedia,
} from "@/lib/wp/article-submit";

const MAX_TITLE = 200;
const MIN_TITLE = 3;
const MIN_CONTENT = 20;
const MAX_CONTENT = 50000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const MAX_ATTACHMENTS = 5;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ATTACHMENT_TYPES = new Set([
  ...IMAGE_TYPES,
  "application/pdf",
]);

function isFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json(
      { ok: false, error: "Origine non autorisée." },
      { status: 403 },
    );
  }

  const user = await getCurrentUser();
  const token = await getAuthToken();
  if (!user || !token) {
    return NextResponse.json(
      { ok: false, error: "Connexion requise." },
      { status: 401 },
    );
  }

  const ip = getClientIp(request);
  const limited = consumeRateLimit({
    key: `submit-article:${user.id}:${ip}`,
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });

  if (!limited.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Trop de soumissions. Réessayez dans ${limited.retryAfterSec}s.`,
      },
      { status: 429 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Requête invalide." },
      { status: 400 },
    );
  }

  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const categoryId = Number(formData.get("categoryId"));
  const tags = parseTagNames(String(formData.get("tags") || ""));
  const youtubeUrl = normalizeYoutubeUrl(String(formData.get("youtubeUrl") || ""));

  if (title.length < MIN_TITLE || title.length > MAX_TITLE) {
    return NextResponse.json(
      { ok: false, error: "Titre invalide." },
      { status: 400 },
    );
  }

  if (content.length < MIN_CONTENT || content.length > MAX_CONTENT) {
    return NextResponse.json(
      { ok: false, error: "Contenu trop court ou trop long." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(categoryId) || categoryId <= 0) {
    return NextResponse.json(
      { ok: false, error: "Catégorie requise." },
      { status: 400 },
    );
  }

  const categories = await getArticleCategories().catch(() => []);
  if (!isAllowedCategoryId(categories, categoryId)) {
    return NextResponse.json(
      { ok: false, error: "Catégorie invalide." },
      { status: 400 },
    );
  }

  const youtubeRaw = String(formData.get("youtubeUrl") || "").trim();
  if (youtubeRaw && !youtubeUrl) {
    return NextResponse.json(
      { ok: false, error: "URL YouTube invalide." },
      { status: 400 },
    );
  }

  const featuredImage = formData.get("featuredImage");
  if (isFile(featuredImage)) {
    if (!IMAGE_TYPES.has(featuredImage.type) || featuredImage.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Image de couverture invalide (max 5 Mo)." },
        { status: 400 },
      );
    }
  }

  const attachmentEntries = formData
    .getAll("attachments")
    .filter(isFile);

  if (attachmentEntries.length > MAX_ATTACHMENTS) {
    return NextResponse.json(
      { ok: false, error: "Trop de pièces jointes." },
      { status: 400 },
    );
  }

  for (const file of attachmentEntries) {
    if (
      !ATTACHMENT_TYPES.has(file.type) ||
      file.size > MAX_ATTACHMENT_BYTES
    ) {
      return NextResponse.json(
        { ok: false, error: "Pièce jointe invalide (PDF ou image, max 10 Mo)." },
        { status: 400 },
      );
    }
  }

  try {
    let featuredMediaId: number | undefined;

    if (isFile(featuredImage)) {
      const uploaded = await uploadWpMedia(token, featuredImage);
      if (!uploaded.ok) {
        return NextResponse.json(
          { ok: false, error: uploaded.message },
          { status: 502 },
        );
      }
      featuredMediaId = uploaded.id;
    }

    const attachmentIds: number[] = [];
    for (const file of attachmentEntries) {
      const uploaded = await uploadWpMedia(token, file);
      if (!uploaded.ok) {
        return NextResponse.json(
          { ok: false, error: uploaded.message },
          { status: 502 },
        );
      }
      attachmentIds.push(uploaded.id);
    }

    const created = await createPendingArticle(token, {
      title,
      content,
      categoryId,
      tags,
      youtubeUrl,
      featuredMediaId,
      attachmentIds,
    });

    if (!created.ok) {
      const status = created.status === 403 ? 403 : 502;
      return NextResponse.json(
        {
          ok: false,
          error:
            created.status === 403
              ? "Votre compte n’a pas la permission de soumettre un article."
              : created.message,
        },
        { status },
      );
    }

    return NextResponse.json({
      ok: true,
      postId: created.id,
      status: "pending",
    });
  } catch (err) {
    console.error("[articles/submit]", err);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur." },
      { status: 500 },
    );
  }
}
