"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { MegaMenuPanel } from "@/components/layout/MegaMenuPanel";
import { Button } from "@/components/ui/Button";
import { Link, usePathname } from "@/i18n/navigation";
import {
  isMegaMenuActive,
  isNavLinkActive,
  SITE_NAV_MEGA_MENUS,
  SITE_NAV_SIMPLE_LINKS,
  visibleNavLinks,
  type SiteNavMegaMenu,
} from "@/lib/navigation/site-nav";
import { SITE_LOGO, SOCIAL_LINKS } from "@/lib/site";

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMegaId, setOpenMegaId] = useState<SiteNavMegaMenu["id"] | null>(
    null,
  );
  const [mobileSection, setMobileSection] = useState<
    SiteNavMegaMenu["id"] | null
  >(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuLabelId = useId();

  const closeMenus = useCallback(() => {
    setMobileOpen(false);
    setOpenMegaId(null);
    setMobileSection(null);
  }, []);

  useEffect(() => {
    closeMenus();
  }, [pathname, closeMenus]);

  useEffect(() => {
    if (!openMegaId) return;

    function handlePointerDown(event: MouseEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpenMegaId(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenMegaId(null);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMegaId]);

  const authCta = user ? (
    <Button
      href="/espace"
      variant="primary"
      className="!min-h-10 !px-4 !py-2 text-xs lg:!min-h-9"
    >
      {t("mySpace")}
    </Button>
  ) : (
    <Button
      href="/connexion"
      variant="primary"
      className="!min-h-10 !px-4 !py-2 text-xs lg:!min-h-9"
    >
      {t("login")}
    </Button>
  );

  const linkClass = (active: boolean) =>
    [
      "text-sm font-medium transition",
      active ? "text-icc-coral" : "text-icc-ink/75 hover:text-icc-ink",
    ].join(" ");

  const megaTriggerClass = (menu: SiteNavMegaMenu) => {
    const active =
      openMegaId === menu.id || isMegaMenuActive(pathname, menu.links);
    return [
      "inline-flex items-center gap-1 rounded-md px-1 py-1 text-sm font-medium transition",
      active ? "text-icc-coral" : "text-icc-ink/75 hover:text-icc-ink",
    ].join(" ");
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-black/5 bg-white text-icc-ink"
    >
      <div className="container-icc flex h-[4.25rem] items-center justify-between gap-3 lg:h-[4.75rem]">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src={SITE_LOGO}
            alt="ICC Online"
            width={160}
            height={54}
            className="h-11 w-auto lg:h-[3.25rem]"
            priority
          />
        </Link>

        <nav
          className="hidden items-center gap-5 xl:gap-6 lg:flex"
          aria-label={t("mainNav")}
        >
          <Link
            href="/"
            className={linkClass(isNavLinkActive(pathname, "/"))}
          >
            {t("home")}
          </Link>

          {SITE_NAV_MEGA_MENUS.map((menu) => (
            <div key={menu.id} className="relative">
              <button
                type="button"
                className={megaTriggerClass(menu)}
                aria-expanded={openMegaId === menu.id}
                aria-controls={`${menuLabelId}-${menu.id}`}
                onClick={() =>
                  setOpenMegaId((current) =>
                    current === menu.id ? null : menu.id,
                  )
                }
              >
                {t(menu.labelKey)}
                <span aria-hidden className="text-[10px] opacity-70">
                  ▾
                </span>
              </button>
            </div>
          ))}

          {SITE_NAV_SIMPLE_LINKS.filter((item) => item.href !== "/").map(
            (item) => (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(isNavLinkActive(pathname, item.href))}
              >
                {t(item.labelKey)}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex xl:gap-4">
          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full transition hover:opacity-80"
              >
                <Image
                  src={social.icon}
                  alt=""
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                />
              </a>
            ))}
          </div>
          {!loading ? authCta : null}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/15 lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
          onClick={() => setMobileOpen((value) => !value)}
        >
          <div className="flex w-4 flex-col gap-1.5">
            <span
              className={[
                "h-0.5 w-full bg-icc-ink transition",
                mobileOpen ? "translate-y-[7px] rotate-45" : "",
              ].join(" ")}
            />
            <span
              className={[
                "h-0.5 w-full bg-icc-ink transition",
                mobileOpen ? "opacity-0" : "",
              ].join(" ")}
            />
            <span
              className={[
                "h-0.5 w-full bg-icc-ink transition",
                mobileOpen ? "-translate-y-[7px] -rotate-45" : "",
              ].join(" ")}
            />
          </div>
        </button>
      </div>

      {openMegaId ? (
        <div id={`${menuLabelId}-${openMegaId}`}>
          <MegaMenuPanel
            menu={
              SITE_NAV_MEGA_MENUS.find((menu) => menu.id === openMegaId)!
            }
            isAuthenticated={Boolean(user)}
            onNavigate={() => setOpenMegaId(null)}
          />
        </div>
      ) : null}

      {mobileOpen ? (
        <div id="mobile-nav" className="border-t border-black/5 bg-white lg:hidden">
          <nav className="px-5 py-5" aria-label={t("mobileNav")}>
            <Link
              href="/"
              className="block py-2 text-base font-medium text-icc-ink"
            >
              {t("home")}
            </Link>

            {SITE_NAV_MEGA_MENUS.map((menu) => {
              const expanded = mobileSection === menu.id;
              const links = visibleNavLinks(menu.links, Boolean(user));

              return (
                <div key={menu.id} className="border-t border-black/5 pt-3 mt-3">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-2 text-left text-base font-semibold text-icc-ink"
                    aria-expanded={expanded}
                    onClick={() =>
                      setMobileSection((current) =>
                        current === menu.id ? null : menu.id,
                      )
                    }
                  >
                    {t(menu.labelKey)}
                    <span aria-hidden>{expanded ? "−" : "+"}</span>
                  </button>
                  {expanded ? (
                    <div className="pb-2 pl-3">
                      {links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block py-2 text-sm text-icc-muted hover:text-icc-coral"
                        >
                          {t(link.labelKey)}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}

            {SITE_NAV_SIMPLE_LINKS.filter((item) => item.href !== "/").map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block border-t border-black/5 py-3 text-base font-medium text-icc-ink"
                >
                  {t(item.labelKey)}
                </Link>
              ),
            )}
          </nav>

          <div className="border-t border-black/5 px-5 py-5">
            <div className="flex items-center gap-2.5">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="inline-flex h-9 w-9 overflow-hidden rounded-full"
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
            <div className="mt-4 [&_a]:w-full">{!loading ? authCta : null}</div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
