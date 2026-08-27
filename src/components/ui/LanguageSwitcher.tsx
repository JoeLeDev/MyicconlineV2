"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LANGS = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className="flex items-center gap-1 text-xs font-semibold tracking-wide"
      aria-label="Language"
    >
      {LANGS.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() =>
            router.replace(pathname, { locale: item.code })
          }
          aria-pressed={locale === item.code}
          title={item.label}
          className={[
            "rounded px-1.5 py-1 uppercase transition",
            locale === item.code
              ? "text-icc-coral"
              : "text-current/70 hover:text-current",
          ].join(" ")}
        >
          {item.code}
        </button>
      ))}
    </div>
  );
}

export function isAppLocale(value: string): value is (typeof routing.locales)[number] {
  return (routing.locales as readonly string[]).includes(value);
}
