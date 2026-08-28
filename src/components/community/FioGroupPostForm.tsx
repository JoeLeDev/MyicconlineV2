"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

type Props = {
  fioId: number;
  fioSlug: string;
};

function groupPath(slug: string): `/groupes/${string}` {
  return `/groupes/${encodeURIComponent(slug)}`;
}

export function FioGroupPostForm({ fioId, fioSlug }: Props) {
  const t = useTranslations("community");
  const router = useRouter();
  const { user, loading } = useAuth();
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || busy) return;

    const text = content.trim();
    if (!text) return;

    setBusy(true);
    setError(null);

    try {
      const res = await fetch(`/api/community/fio/${fioId}/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };

      if (res.ok && json.ok) {
        setContent("");
        router.refresh();
        return;
      }

      setError(json.error || t("groupPostError"));
    } catch {
      setError(t("networkError"));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-black/8 bg-white px-5 py-4 text-sm text-icc-muted">
        {t("loginToPostInGroup")}{" "}
        <Link
          href={{
            pathname: "/connexion",
            query: { next: groupPath(fioSlug) },
          }}
          className="font-semibold text-icc-coral hover:text-icc-coral-deep"
        >
          {t("loginLink")}
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="rounded-2xl border border-black/8 bg-white p-4 md:p-5"
    >
      <label htmlFor={`group-post-${fioId}`} className="sr-only">
        {t("groupPostPlaceholder")}
      </label>
      <textarea
        id={`group-post-${fioId}`}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={t("groupPostPlaceholder")}
        rows={3}
        maxLength={5000}
        disabled={busy}
        className="w-full resize-y rounded-xl border border-black/10 bg-icc-cream/30 px-4 py-3 text-sm text-icc-ink outline-none transition placeholder:text-icc-muted focus:border-icc-coral focus:ring-2 focus:ring-icc-coral/20 disabled:opacity-60"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-icc-muted">{t("groupPostHint")}</p>
        <button
          type="submit"
          disabled={busy || !content.trim()}
          className="inline-flex rounded-lg border border-icc-coral bg-icc-coral px-5 py-2 text-sm font-semibold text-white transition hover:border-icc-coral-deep hover:bg-icc-coral-deep disabled:opacity-60"
        >
          {busy ? t("groupPostSubmitting") : t("groupPostSubmit")}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
