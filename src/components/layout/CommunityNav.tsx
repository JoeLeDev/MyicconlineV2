"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { CMS_NAV_ITEMS } from "@/lib/wp/page-config";

export function CommunityNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      className="border-b border-black/5 bg-icc-cream/60"
      aria-label={t("communityNav")}
    >
      <div className="container-icc">
        <ul className="-mx-1 flex gap-1 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:justify-center md:gap-2">
          {CMS_NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  className={[
                    "inline-flex rounded-lg px-3 py-2 text-xs font-semibold tracking-wide transition md:px-4 md:text-sm",
                    active
                      ? "bg-icc-coral text-white"
                      : "text-icc-ink/75 hover:bg-white hover:text-icc-ink",
                  ].join(" ")}
                >
                  {t(item.labelKey)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
