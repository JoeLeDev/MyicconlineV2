import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "outline" | "ghost" | "light";

const variants: Record<Variant, string> = {
  primary:
    "border border-icc-coral bg-icc-coral text-white hover:bg-icc-coral-deep hover:border-icc-coral-deep",
  outline:
    "border border-white/85 bg-transparent text-white hover:bg-white/10",
  ghost:
    "border border-icc-ink/15 bg-white text-icc-ink hover:border-icc-ink/40 hover:bg-icc-cream",
  light:
    "border border-white bg-white text-icc-ink hover:bg-icc-cream",
};

type ButtonProps = {
  href: string;
  variant?: Variant;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<ComponentProps<"a">, "href" | "className" | "children">;

export function Button({
  href,
  variant = "primary",
  external = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold tracking-wide transition duration-200",
    variants[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (external || href.startsWith("http")) {
    return (
      <a
        href={href}
        className={classes}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}
