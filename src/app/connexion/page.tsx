import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte ICC Online.",
};

export default function ConnexionPage() {
  return (
    <div className="bg-white py-12 md:py-16">
      <div className="container-icc grid max-w-4xl gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
            Espace membre
          </p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight text-icc-ink">
            Connexion
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-icc-muted md:text-lg">
            Accédez à votre espace ICC Online avec les identifiants de la
            communauté.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="border border-black/8 bg-icc-cream/40 p-6 text-sm text-icc-muted md:p-8">
              Chargement…
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
