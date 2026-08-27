import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-icc flex min-h-[60vh] flex-col items-start justify-center py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
        404
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-icc-ink md:text-4xl">
        Page introuvable
      </h1>
      <p className="mt-3 max-w-md text-icc-muted">
        Cette page n’existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-lg border border-icc-coral bg-icc-coral px-5 py-3 text-sm font-semibold text-white hover:bg-icc-coral-deep"
      >
        Retour à l’accueil
      </Link>
    </div>
  );
}
