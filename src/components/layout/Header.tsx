"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { MAIN_NAV, SITE_LOGO, SOCIAL_LINKS } from "@/lib/site";
import { Button } from "@/components/ui/Button";

export function Header() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const authCta = user ? (
    <Button href="/espace" variant="primary" className="!px-4 !py-2 text-xs">
      Mon espace
    </Button>
  ) : (
    <Button
      href="/connexion"
      variant="primary"
      className="!px-4 !py-2 text-xs"
    >
      Je me connecte
    </Button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white text-icc-ink">
      <div className="container-icc flex h-[4.25rem] items-center justify-between gap-4 md:h-[4.75rem]">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src={SITE_LOGO}
            alt="ICC Online"
            width={160}
            height={54}
            className="h-11 w-auto md:h-[3.25rem]"
            priority
          />
        </Link>

        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label="Principal"
        >
          {MAIN_NAV.map((item) => {
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
                  active
                    ? "text-icc-coral"
                    : "text-icc-ink/75 hover:text-icc-ink",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-2.5">
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
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/15 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <div className="flex w-4 flex-col gap-1.5">
            <span
              className={[
                "h-0.5 w-full bg-icc-ink transition",
                open ? "translate-y-[7px] rotate-45" : "",
              ].join(" ")}
            />
            <span
              className={[
                "h-0.5 w-full bg-icc-ink transition",
                open ? "opacity-0" : "",
              ].join(" ")}
            />
            <span
              className={[
                "h-0.5 w-full bg-icc-ink transition",
                open ? "-translate-y-[7px] -rotate-45" : "",
              ].join(" ")}
            />
          </div>
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-black/5 bg-white px-5 py-5 md:hidden"
        >
          <nav className="flex flex-col gap-3" aria-label="Mobile">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-1 text-base font-medium text-icc-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="inline-flex h-8 w-8 overflow-hidden rounded-full"
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
            {authCta}
          </div>
        </div>
      ) : null}
    </header>
  );
}
