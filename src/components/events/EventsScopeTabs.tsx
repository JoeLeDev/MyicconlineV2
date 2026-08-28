"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

export function EventsScopeTabs() {
  const t = useTranslations("events");
  const searchParams = useSearchParams();
  const scope = searchParams.get("scope") === "past" ? "past" : "upcoming";

  const tabClass = (active: boolean) =>
    [
      "inline-flex min-h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition",
      active
        ? "bg-icc-coral text-white"
        : "border border-black/10 bg-white text-icc-ink hover:border-icc-coral/35 hover:bg-icc-cream/40",
    ].join(" ");

  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label={t("title")}
    >
      <Link
        href="/evenements"
        role="tab"
        aria-selected={scope === "upcoming"}
        className={tabClass(scope === "upcoming")}
      >
        {t("tabUpcoming")}
      </Link>
      <Link
        href={{ pathname: "/evenements", query: { scope: "past" } }}
        role="tab"
        aria-selected={scope === "past"}
        className={tabClass(scope === "past")}
      >
        {t("tabPast")}
      </Link>
    </div>
  );
}
