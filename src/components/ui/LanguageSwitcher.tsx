"use client";

import { useState } from "react";

const LANGS = [
  { code: "FR", label: "Français" },
  { code: "EN", label: "English" },
  { code: "DE", label: "Deutsch" },
  { code: "ES", label: "Español" },
] as const;

export function LanguageSwitcher() {
  const [lang, setLang] = useState<(typeof LANGS)[number]["code"]>("FR");

  return (
    <div
      className="flex items-center gap-1 text-xs font-semibold tracking-wide"
      aria-label="Sélecteur de langue"
    >
      {LANGS.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => setLang(item.code)}
          aria-pressed={lang === item.code}
          title={item.label}
          className={[
            "rounded px-1.5 py-1 transition",
            lang === item.code
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
