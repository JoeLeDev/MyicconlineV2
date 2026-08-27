"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { CONTACT_EMAIL } from "@/lib/site";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        fallback?: string;
      };

      if (res.ok && json.ok) {
        setStatus("success");
        form.reset();
        return;
      }

      if (json.fallback === "mailto" || res.status === 503) {
        const subject = encodeURIComponent(`Contact ICC Online — ${name}`);
        const body = encodeURIComponent(
          `Nom : ${name}\nE-mail : ${email}\n\nMessage :\n${message}`,
        );
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
        setStatus("success");
        return;
      }

      setError(json.error || t("sendError"));
      setStatus("error");
    } catch {
      setError(t("networkError"));
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-icc-coral/25 bg-icc-cream px-6 py-10">
        <h2 className="text-xl font-bold text-icc-ink">{t("thanksTitle")}</h2>
        <p className="mt-2 text-icc-muted">{t("thanksBody")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 border border-black/8 bg-icc-cream/40 p-6 md:p-8"
    >
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-semibold text-icc-ink"
        >
          {t("name")}
        </label>
        <input
          id="name"
          name="name"
          required
          disabled={status === "loading"}
          className="w-full border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-icc-coral disabled:opacity-60"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-semibold text-icc-ink"
        >
          {t("emailLabel")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={status === "loading"}
          className="w-full border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-icc-coral disabled:opacity-60"
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm font-semibold text-icc-ink"
        >
          {t("message")}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          disabled={status === "loading"}
          className="w-full resize-y border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-icc-coral disabled:opacity-60"
        />
      </div>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center rounded-lg border border-icc-coral bg-icc-coral px-5 py-3 text-sm font-semibold text-white transition hover:border-icc-coral-deep hover:bg-icc-coral-deep disabled:opacity-60"
      >
        {status === "loading" ? t("sending") : t("send")}
      </button>
    </form>
  );
}
