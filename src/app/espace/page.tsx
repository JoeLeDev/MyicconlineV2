import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { getCurrentUser } from "@/lib/auth/session";
import { getWpLoginUrl } from "@/lib/wp/config";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Mon espace",
  description: "Espace membre ICC Online.",
};

export default async function EspacePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/connexion?next=/espace");
  }

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="container-icc max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
          Espace membre
        </p>
        <h1 className="mt-2 text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight text-icc-ink">
          Bonjour {user.name}
        </h1>
        <p className="mt-3 text-icc-muted">
          Vous êtes connecté à ICC Online. La communauté complète reste
          accessible sur WordPress pour l’instant.
        </p>

        <div className="mt-10 flex flex-col gap-6 border border-black/8 bg-icc-cream/40 p-6 md:flex-row md:items-center md:p-8">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt=""
              width={72}
              height={72}
              className="h-[72px] w-[72px] rounded-full object-cover"
            />
          ) : (
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-icc-coral/15 text-xl font-bold text-icc-coral">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <p className="font-semibold text-icc-ink">{user.name}</p>
            {user.email ? (
              <p className="mt-1 text-sm text-icc-muted">{user.email}</p>
            ) : null}
            <p className="mt-1 text-sm text-icc-muted">@{user.slug}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={getWpLoginUrl()} variant="primary">
            Ouvrir la communauté WP
          </Button>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-lg border border-icc-ink/15 bg-white px-5 py-3 text-sm font-semibold text-icc-ink transition hover:bg-icc-cream"
          >
            Voir le blog
          </Link>
        </div>
      </div>
    </div>
  );
}
