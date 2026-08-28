"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ArticleCategory } from "@/lib/wp/article-categories";

type Props = {
  categories: ArticleCategory[];
  memberName: string;
};

type Status = "idle" | "loading" | "success" | "error";

export function SubmitArticleForm({ categories, memberName }: Props) {
  const t = useTranslations("submitArticle");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/articles/submit", {
        method: "POST",
        body: data,
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };

      if (res.ok && json.ok) {
        setStatus("success");
        form.reset();
        return;
      }

      setError(json.error || t("submitError"));
      setStatus("error");
    } catch {
      setError(t("networkError"));
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-icc-coral/25 bg-icc-cream px-6 py-10 md:px-8">
        <h2 className="text-xl font-bold text-icc-ink">{t("successTitle")}</h2>
        <p className="mt-2 leading-relaxed text-icc-muted">{t("successBody")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-lg border border-icc-coral bg-icc-coral px-5 py-2.5 text-sm font-semibold text-white transition hover:border-icc-coral-deep hover:bg-icc-coral-deep"
          >
            {t("viewBlog")}
          </Link>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="inline-flex items-center justify-center rounded-lg border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-icc-ink transition hover:border-icc-coral hover:text-icc-coral"
          >
            {t("submitAnother")}
          </button>
        </div>
      </div>
    );
  }

  const inputClassName =
    "w-full border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-icc-coral disabled:opacity-60";

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-xl border border-black/8 bg-icc-cream/40 p-6 md:p-8"
    >
      <p className="text-sm text-icc-muted">
        {t("connectedAs", { name: memberName })}
      </p>

      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-semibold text-icc-ink">
          {t("titleLabel")}
        </label>
        <input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={200}
          disabled={status === "loading"}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="categoryId" className="mb-1.5 block text-sm font-semibold text-icc-ink">
          {t("categoryLabel")}
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          disabled={status === "loading"}
          defaultValue=""
          className={inputClassName}
        >
          <option value="" disabled>
            {t("categoryPlaceholder")}
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="content" className="mb-1.5 block text-sm font-semibold text-icc-ink">
          {t("contentLabel")}
        </label>
        <textarea
          id="content"
          name="content"
          required
          minLength={20}
          rows={8}
          disabled={status === "loading"}
          className={`${inputClassName} resize-y`}
        />
      </div>

      <div>
        <label htmlFor="tags" className="mb-1.5 block text-sm font-semibold text-icc-ink">
          {t("tagsLabel")}
        </label>
        <input
          id="tags"
          name="tags"
          disabled={status === "loading"}
          placeholder={t("tagsPlaceholder")}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="youtubeUrl" className="mb-1.5 block text-sm font-semibold text-icc-ink">
          {t("youtubeLabel")}
        </label>
        <input
          id="youtubeUrl"
          name="youtubeUrl"
          type="url"
          disabled={status === "loading"}
          placeholder="https://www.youtube.com/watch?v=…"
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="featuredImage" className="mb-1.5 block text-sm font-semibold text-icc-ink">
          {t("featuredImageLabel")}
        </label>
        <input
          id="featuredImage"
          name="featuredImage"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={status === "loading"}
          className="block w-full text-sm text-icc-muted file:mr-3 file:rounded-md file:border-0 file:bg-icc-coral file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-icc-coral-deep"
        />
        <p className="mt-1.5 text-xs text-icc-muted">{t("featuredImageHint")}</p>
      </div>

      <div>
        <label htmlFor="attachments" className="mb-1.5 block text-sm font-semibold text-icc-ink">
          {t("attachmentsLabel")}
        </label>
        <input
          id="attachments"
          name="attachments"
          type="file"
          multiple
          accept="application/pdf,image/jpeg,image/png,image/webp,image/gif"
          disabled={status === "loading"}
          className="block w-full text-sm text-icc-muted file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-icc-ink file:ring-1 file:ring-black/10 hover:file:ring-icc-coral"
        />
        <p className="mt-1.5 text-xs text-icc-muted">{t("attachmentsHint")}</p>
      </div>

      <p className="text-sm leading-relaxed text-icc-muted">{t("moderationNote")}</p>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-full items-center justify-center rounded-lg border border-icc-coral bg-icc-coral px-5 py-3 text-sm font-semibold text-white transition hover:border-icc-coral-deep hover:bg-icc-coral-deep disabled:opacity-60 sm:w-auto"
      >
        {status === "loading" ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
