import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "de", "es"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
  localeDetection: true,
});

export type AppLocale = (typeof routing.locales)[number];
