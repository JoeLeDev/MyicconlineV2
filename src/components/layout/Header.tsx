"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getWpLoginUrl } from "@/lib/wp/config";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

const LOGO_SRC =
  "https://myicconline.com/wp-content/themes/network-child/assets/logo-icc.png";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";
  const solid = !isHome || scrolled || open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        solid
          ? "border-b border-black/5 bg-icc-black/95 text-white backdrop-blur-md"
          : "bg-transparent text-white",
      ].join(" ")}
    >
      <div className="container-icc flex h-[4.25rem] items-center justify-between gap-4 md:h-[4.75rem]">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src={LOGO_SRC}
            alt="ICC Online"
            width={160}
            height={54}
            className="h-11 w-auto md:h-[3.25rem]"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Principal">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "text-sm font-medium transition",
                  active ? "text-icc-coral-hot" : "text-white/90 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <LanguageSwitcher />
          <Button href={getWpLoginUrl()} variant="outline" className="!py-2 !px-4 text-xs">
            Je me connecte
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/25 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <div className="flex w-4 flex-col gap-1.5">
            <span
              className={[
                "h-0.5 w-full bg-white transition",
                open ? "translate-y-[7px] rotate-45" : "",
              ].join(" ")}
            />
            <span
              className={[
                "h-0.5 w-full bg-white transition",
                open ? "opacity-0" : "",
              ].join(" ")}
            />
            <span
              className={[
                "h-0.5 w-full bg-white transition",
                open ? "-translate-y-[7px] -rotate-45" : "",
              ].join(" ")}
            />
          </div>
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-white/10 bg-icc-black px-5 py-5 md:hidden"
        >
          <nav className="flex flex-col gap-3" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-1 text-base font-medium text-white/90"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-5 flex items-center justify-between gap-3">
            <LanguageSwitcher />
            <Button href={getWpLoginUrl()} variant="outline" className="!py-2 !px-4 text-xs">
              Je me connecte
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
