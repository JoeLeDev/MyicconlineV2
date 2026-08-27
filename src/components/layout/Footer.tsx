import Image from "next/image";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

const SOCIALS = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/",
    icon: "https://myicconline.com/wp-content/themes/network-child/assets/Instagram.png",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/",
    icon: "https://myicconline.com/wp-content/themes/network-child/assets/Facebook.png",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/",
    icon: "https://myicconline.com/wp-content/themes/network-child/assets/Tiktok.png",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/",
    icon: "https://myicconline.com/wp-content/themes/network-child/assets/Youtube.png",
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="container-icc flex flex-col items-center gap-6 py-12 text-center">
        <div className="flex items-center gap-4">
          {SOCIALS.map((social) => (
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

        <p className="text-sm text-icc-muted">
          © {year} — My ICC Online · Impact Centre Chrétien
        </p>

        <nav
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-icc-muted"
          aria-label="Légal"
        >
          <Link href="/a-propos" className="hover:text-icc-ink">
            À propos
          </Link>
          <Link href="/contact" className="hover:text-icc-ink">
            Contact
          </Link>
          <Link href="/blog" className="hover:text-icc-ink">
            Blog
          </Link>
        </nav>
      </div>
    </footer>
  );
}
