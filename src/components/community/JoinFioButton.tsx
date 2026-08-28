"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

type Props = {
  fioId: number;
  fioName: string;
  fioSlug: string;
  variant?: "default" | "hero";
};

function groupPath(slug: string): `/groupes/${string}` {
  return `/groupes/${encodeURIComponent(slug)}`;
}

export function JoinFioButton({
  fioId,
  fioName,
  fioSlug,
  variant = "default",
}: Props) {
  const t = useTranslations("community");
  const hero = variant === "hero";
  const { user, loading } = useAuth();
  const [isMember, setIsMember] = useState(false);
  const [membershipChecked, setMembershipChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

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
        const res = await fetch(`/api/community/fio/${fioId}/membership`, {
          cache: "no-store",
        });
        const json = (await res.json()) as {
          ok?: boolean;
          isMember?: boolean;
          isPending?: boolean;
        };

        if (!cancelled && res.ok && json.ok) {
          setIsMember(Boolean(json.isMember));
          setPending(Boolean(json.isPending));
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
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        membershipStatus?: string;
      };

      if (res.ok && json.ok) {
        if (json.membershipStatus === "pending") {
          setPending(true);
          setSuccess(true);
          return;
        }

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
      <p className={[hero ? "text-sm text-white/85" : "mt-4 text-sm text-icc-muted"].join(" ")}>
        {t("loginToJoinFio")}{" "}
        <Link
          href={{
            pathname: "/connexion",
            query: { next: groupPath(fioSlug) },
          }}
          className={[
            "font-semibold",
            hero
              ? "text-white underline decoration-white/40 underline-offset-2 hover:decoration-white"
              : "text-icc-coral hover:text-icc-coral-deep",
          ].join(" ")}
        >
          {t("loginLink")}
        </Link>
      </p>
    );
  }

  if (isMember || pending) {
    return (
      <p
        className={[
          "inline-flex rounded-lg px-4 py-2 text-sm font-semibold",
          hero
            ? "border border-white/30 bg-white/10 text-white"
            : "mt-4 border border-icc-coral/30 bg-icc-coral/10 text-icc-coral",
        ].join(" ")}
      >
        {pending
          ? t("joinFioPending", { name: fioName })
          : success
            ? t("joinFioSuccess", { name: fioName })
            : t("alreadyMember")}
      </p>
    );
  }

  return (
    <div className={hero ? undefined : "mt-4"}>
      <button
        type="button"
        onClick={() => void handleJoin()}
        disabled={busy}
        className={[
          "inline-flex rounded-lg px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60",
          hero
            ? "border border-white bg-white text-icc-coral hover:bg-icc-cream"
            : "border border-icc-coral bg-icc-coral text-white hover:border-icc-coral-deep hover:bg-icc-coral-deep",
        ].join(" ")}
      >
        {busy ? t("joinFioSubmitting") : t("joinFio")}
      </button>
      {error ? (
        <p className={["mt-2 text-sm", hero ? "text-red-200" : "text-red-600"].join(" ")}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
