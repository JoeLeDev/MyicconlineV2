import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  updated?: string;
  children: ReactNode;
};

export function LegalDocument({ eyebrow, title, updated, children }: Props) {
  return (
    <div className="bg-white py-12 md:py-16">
      <article className="container-icc max-w-3xl">
        <header className="mb-10 md:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-[clamp(1.85rem,4vw,2.75rem)] font-extrabold tracking-tight text-icc-ink">
            {title}
          </h1>
          {updated ? (
            <p className="mt-3 text-sm text-icc-muted">{updated}</p>
          ) : null}
        </header>
        <div className="legal-prose">{children}</div>
      </article>
    </div>
  );
}
