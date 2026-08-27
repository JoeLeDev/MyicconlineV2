"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { getWpLoginUrl } from "@/lib/wp/config";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData(e.currentTarget);
    const username = String(data.get("username") || "").trim();
    const password = String(data.get("password") || "");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !json.ok) {
        setError(json.error || "Connexion impossible.");
        setLoading(false);
        return;
      }

      await refresh();
      const next = searchParams.get("next") || "/espace";
      const safeNext =
        next.startsWith("/") &&
        !next.startsWith("//") &&
        !next.includes("://") &&
        !next.includes("\\")
          ? next
          : "/espace";
      router.replace(safeNext);
      router.refresh();
    } catch {
      setError("Erreur réseau. Réessayez.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 border border-black/8 bg-icc-cream/40 p-6 md:p-8"
    >
      <div>
        <label
          htmlFor="username"
          className="mb-1.5 block text-sm font-semibold text-icc-ink"
        >
          Identifiant ou e-mail
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          required
          disabled={loading}
          className="w-full border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-icc-coral disabled:opacity-60"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-semibold text-icc-ink"
        >
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={loading}
          className="w-full border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-icc-coral disabled:opacity-60"
        />
      </div>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-lg border border-icc-coral bg-icc-coral px-5 py-3 text-sm font-semibold text-white transition hover:border-icc-coral-deep hover:bg-icc-coral-deep disabled:opacity-60"
      >
        {loading ? "Connexion…" : "Je me connecte"}
      </button>

      <p className="text-center text-sm text-icc-muted">
        Pas encore de compte ?{" "}
        <a
          href={`${getWpLoginUrl().replace(/\/$/, "")}/register/`}
          className="font-medium text-icc-coral hover:text-icc-coral-deep"
        >
          Créer un compte
        </a>
      </p>
    </form>
  );
}
