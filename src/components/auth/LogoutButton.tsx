"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "@/i18n/navigation";

export function LogoutButton() {
  const t = useTranslations("auth");
  const { logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    await logout();
    router.replace("/connexion");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-lg border border-icc-ink/15 bg-white px-4 py-2 text-sm font-semibold text-icc-ink transition hover:bg-icc-cream disabled:opacity-60"
    >
      {loading ? t("loggingOut") : t("logout")}
    </button>
  );
}
