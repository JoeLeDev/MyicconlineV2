"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

type Props = {
  fioId: number;
  fioName: string;
  fioSlug: string;
};

function groupPath(slug: string): `/groupes/${string}` {
  return `/groupes/${encodeURIComponent(slug)}`;
}

export function JoinFioButton({ fioId, fioName, fioSlug }: Props) {
  const t = useTranslations("community");
  const { user, loading } = useAuth();
  const [isMember, setIsMember] = useState(false);
  const [membershipChecked, setMembershipChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsMember(false);
      setMembershipChecked(true);
      return;
    }

    let cancelled = false;
    setMembershipChecked(false);

    void (async () => {
      try {
        const res = await fetch("/api/community/me/fios", { cache: "no-store" });
        const json = (await res.json()) as {
          ok?: boolean;
          fios?: { id: number }[];
        };

        if (!cancelled && res.ok && json.ok && json.fios) {
          setIsMember(json.fios.some((fio) => fio.id === fioId));
        }
      } catch {
        // Ne pas bloquer la page si la vérification échoue.
      } finally {
        if (!cancelled) {
          setMembershipChecked(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, fioId]);

  async function handleJoin() {
    if (!user || busy || isMember) return;
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/community/fio/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fioId }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };

      if (res.ok && json.ok) {
        setIsMember(true);
        setSuccess(true);
        return;
      }

      setError(json.error || t("joinFioError"));
    } catch {
      setError(t("networkError"));
    } finally {
      setBusy(false);
    }
  }

  if (loading || (user && !membershipChecked)) {
    return null;
  }

  if (!user) {
    return (
      <p className="mt-4 text-sm text-icc-muted">
        {t("loginToJoinFio")}{" "}
        <Link
          href={{
            pathname: "/connexion",
            query: { next: groupPath(fioSlug) },
          }}
          className="font-semibold text-icc-coral hover:text-icc-coral-deep"
        >
          {t("loginLink")}
        </Link>
      </p>
    );
  }

  if (isMember) {
    return (
      <p className="mt-4 inline-flex rounded-lg border border-icc-coral/30 bg-icc-coral/10 px-4 py-2 text-sm font-semibold text-icc-coral">
        {success ? t("joinFioSuccess", { name: fioName }) : t("alreadyMember")}
      </p>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => void handleJoin()}
        disabled={busy}
        className="inline-flex rounded-lg border border-icc-coral bg-icc-coral px-5 py-2.5 text-sm font-semibold text-white transition hover:border-icc-coral-deep hover:bg-icc-coral-deep disabled:opacity-60"
      >
        {busy ? t("joinFioSubmitting") : t("joinFio")}
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
