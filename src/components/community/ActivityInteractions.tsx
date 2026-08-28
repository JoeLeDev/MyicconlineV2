"use client";

import Image from "next/image";
import { FormEvent, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PostContent } from "@/components/blog/PostContent";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatDateTime } from "@/lib/utils/dates";

type CommentItem = {
  id: number;
  userId: number;
  content: string;
  date: string;
  userName: string;
  userAvatar: string;
};

type Props = {
  activityId: number;
  initialFavorited: boolean;
  initialFavoriteCount: number;
  initialCommentCount: number;
  locale?: string;
};

export function ActivityInteractions({
  activityId,
  initialFavorited,
  initialFavoriteCount,
  initialCommentCount,
  locale = "fr",
}: Props) {
  const t = useTranslations("community");
  const { user, loading } = useAuth();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favoriteCount, setFavoriteCount] = useState(initialFavoriteCount);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);

  const loadComments = useCallback(async () => {
    if (commentsLoaded || commentsLoading) return;
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/community/activity/${activityId}/comments`);
      const json = (await res.json()) as {
        ok?: boolean;
        comments?: CommentItem[];
      };
      if (res.ok && json.ok && json.comments) {
        setComments(json.comments);
        setCommentsLoaded(true);
      }
    } catch {
      setCommentError(t("commentsLoadError"));
    } finally {
      setCommentsLoading(false);
    }
  }, [activityId, commentsLoaded, commentsLoading, t]);

  async function toggleFavorite() {
    if (!user || favoriteBusy) return;
    setFavoriteBusy(true);
    try {
      const res = await fetch(`/api/community/activity/${activityId}/favorite`, {
        method: "POST",
      });
      const json = (await res.json()) as {
        ok?: boolean;
        favorited?: boolean;
        favoriteCount?: number;
        error?: string;
      };

      if (res.ok && json.ok) {
        setFavorited(Boolean(json.favorited));
        if (typeof json.favoriteCount === "number") {
          setFavoriteCount(json.favoriteCount);
        }
        return;
      }

      setCommentError(json.error || t("favoriteError"));
    } catch {
      setCommentError(t("networkError"));
    } finally {
      setFavoriteBusy(false);
    }
  }

  async function onSubmitComment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || commentBusy) return;

    const form = e.currentTarget;
    const data = new FormData(form);
    const content = String(data.get("content") || "").trim();
    if (!content) return;

    setCommentBusy(true);
    setCommentError(null);

    try {
      const res = await fetch(`/api/community/activity/${activityId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        comment?: CommentItem;
        error?: string;
      };

      if (res.ok && json.ok && json.comment) {
        setComments((prev) => [...prev, json.comment!]);
        setCommentsLoaded(true);
        setCommentCount((count) => count + 1);
        form.reset();
        return;
      }

      setCommentError(json.error || t("commentError"));
    } catch {
      setCommentError(t("networkError"));
    } finally {
      setCommentBusy(false);
    }
  }

  function handleToggleComments() {
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (next) {
      void loadComments();
    }
  }

  if (loading) {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-icc-muted">
        {commentCount > 0 ? (
          <span>{t("comments", { count: commentCount })}</span>
        ) : null}
        {favoriteCount > 0 ? (
          <span>{t("favorites", { count: favoriteCount })}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
        {user ? (
          <button
            type="button"
            onClick={() => void toggleFavorite()}
            disabled={favoriteBusy}
            aria-pressed={favorited}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition disabled:opacity-60 ${
              favorited
                ? "border-icc-coral bg-icc-coral/10 text-icc-coral"
                : "border-black/10 text-icc-muted hover:border-icc-coral/40 hover:text-icc-coral"
            }`}
          >
            <span aria-hidden>{favorited ? "★" : "☆"}</span>
            {favorited ? t("unfavorite") : t("favorite")}
            {favoriteCount > 0 ? (
              <span className="text-icc-muted">({favoriteCount})</span>
            ) : null}
          </button>
        ) : (
          favoriteCount > 0 ? (
            <span className="text-icc-muted">
              {t("favorites", { count: favoriteCount })}
            </span>
          ) : null
        )}

        <button
          type="button"
          onClick={handleToggleComments}
          className="text-icc-coral hover:text-icc-coral-deep"
        >
          {commentsOpen
            ? t("hideComments")
            : t("showComments", { count: commentCount })}
        </button>
      </div>

      {!user && !loading ? (
        <p className="text-xs text-icc-muted">
          {t("loginToInteract")}{" "}
          <Link
            href={{
              pathname: "/connexion",
              query: { next: "/activites" },
            }}
            className="font-semibold text-icc-coral hover:text-icc-coral-deep"
          >
            {t("loginLink")}
          </Link>
        </p>
      ) : null}

      {commentsOpen ? (
        <div className="rounded-lg border border-black/6 bg-white px-4 py-3">
          {commentsLoading ? (
            <p className="text-xs text-icc-muted">{t("loadingComments")}</p>
          ) : null}

          {!commentsLoading && comments.length === 0 ? (
            <p className="text-xs text-icc-muted">{t("noComments")}</p>
          ) : null}

          <ul className="space-y-3">
            {comments.map((comment) => (
              <li key={comment.id} className="flex gap-3">
                {comment.userAvatar ? (
                  <Image
                    src={comment.userAvatar}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-icc-coral/15 text-xs font-bold text-icc-coral"
                    aria-hidden
                  >
                    {comment.userName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-icc-ink">
                    {comment.userName}
                    <span className="ml-2 font-normal text-icc-muted">
                      {formatDateTime(comment.date, locale)}
                    </span>
                  </p>
                  <div className="prose-icc mt-1 text-sm text-icc-ink">
                    <PostContent html={comment.content} />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {user ? (
            <form onSubmit={onSubmitComment} className="mt-4 space-y-2 border-t border-black/6 pt-4">
              <label htmlFor={`comment-${activityId}`} className="sr-only">
                {t("commentPlaceholder")}
              </label>
              <textarea
                id={`comment-${activityId}`}
                name="content"
                rows={3}
                maxLength={5000}
                placeholder={t("commentPlaceholder")}
                disabled={commentBusy}
                className="w-full resize-y border border-black/10 bg-icc-cream/40 px-3 py-2 text-sm outline-none transition focus:border-icc-coral disabled:opacity-60"
              />
              {commentError ? (
                <p className="text-xs text-red-600">{commentError}</p>
              ) : null}
              <button
                type="submit"
                disabled={commentBusy}
                className="inline-flex rounded-lg border border-icc-coral bg-icc-coral px-4 py-2 text-xs font-semibold text-white transition hover:border-icc-coral-deep hover:bg-icc-coral-deep disabled:opacity-60"
              >
                {commentBusy ? t("commentSubmitting") : t("commentSubmit")}
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
