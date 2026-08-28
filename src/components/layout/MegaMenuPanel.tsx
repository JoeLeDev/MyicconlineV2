"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { SiteNavMegaMenu } from "@/lib/navigation/site-nav";
import { visibleNavLinks } from "@/lib/navigation/site-nav";

type Props = {
  menu: SiteNavMegaMenu;
  isAuthenticated: boolean;
  onNavigate: () => void;
};

export function MegaMenuPanel({ menu, isAuthenticated, onNavigate }: Props) {
  const t = useTranslations("nav");
  const links = visibleNavLinks(menu.links, isAuthenticated);

  return (
    <div className="border-t border-black/8 bg-white shadow-lg">
      <div className="container-icc py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className="group rounded-xl border border-transparent px-4 py-3 transition hover:border-icc-coral/20 hover:bg-icc-cream/50"
            >
              <span className="block text-sm font-semibold text-icc-ink group-hover:text-icc-coral">
                {t(link.labelKey)}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-icc-muted">
                {t(link.descriptionKey)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
