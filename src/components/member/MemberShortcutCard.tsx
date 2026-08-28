import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type Props = {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  external?: boolean;
  ariaLabel?: string;
};

const cardClass =
  "group flex h-full flex-col gap-3 rounded-xl border border-black/8 bg-white p-5 transition hover:border-icc-coral/35 hover:bg-icc-cream/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-icc-coral focus-visible:ring-offset-2";

export function MemberShortcutCard({
  href,
  title,
  description,
  icon,
  external = false,
  ariaLabel,
}: Props) {
  const content = (
    <>
      <span
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-icc-coral/10 text-icc-coral transition group-hover:bg-icc-coral/15"
        aria-hidden
      >
        {icon}
      </span>
      <span>
        <span className="block font-semibold text-icc-ink group-hover:text-icc-coral-deep">
          {title}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-icc-muted">
          {description}
        </span>
      </span>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClass}
        aria-label={ariaLabel ?? `${title} — ${description}`}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={cardClass} aria-label={ariaLabel ?? title}>
      {content}
    </Link>
  );
}
