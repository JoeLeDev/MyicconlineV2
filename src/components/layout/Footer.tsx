"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Link } from "@/i18n/navigation";
import { SOCIAL_LINKS } from "@/lib/site";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="container-icc flex flex-col items-center gap-6 py-12 text-center">
        <div className="flex items-center gap-4">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full transition hover:opacity-80"
            >
              <Image
                src={social.icon}
                alt=""
                width={36}
                height={36}
                className="h-full w-full object-contain"
              />
            </a>
          ))}
        </div>

        <LanguageSwitcher />

        <p className="text-sm text-icc-muted">{t("copyright", { year })}</p>

        <nav
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-icc-muted"
          aria-label="Legal"
        >
          <Link href="/a-propos" className="hover:text-icc-ink">
            {t("about")}
          </Link>
          <Link href="/contact" className="hover:text-icc-ink">
            {t("contact")}
          </Link>
          <Link href="/blog" className="hover:text-icc-ink">
            {t("blog")}
          </Link>
          <Link href="/mentions-legales" className="hover:text-icc-ink">
            {t("legal")}
          </Link>
          <Link
            href="/politique-de-confidentialite"
            className="hover:text-icc-ink"
          >
            {t("privacy")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
