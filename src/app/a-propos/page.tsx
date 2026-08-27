import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { getWpLoginUrl } from "@/lib/wp/config";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Découvrez ICC Online, le campus digital d’Impact Centre Chrétien — une famille connectée pour vivre la foi ensemble.",
};

export default function AboutPage() {
  return (
    <div className="bg-white py-12 md:py-16">
      <div className="container-icc max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
          Qui sommes-nous
        </p>
        <h1 className="mt-2 text-[clamp(2rem,5vw,3.2rem)] font-extrabold tracking-tight text-icc-ink">
          À propos d’ICC Online
        </h1>

        <div className="mt-8 space-y-5 text-base leading-relaxed text-icc-muted md:text-lg">
          <p>
            Impact Centre Chrétien en ligne est la dimension digitale des
            églises Impact Centre Chrétien. Campus à part entière,{" "}
            <strong className="font-semibold text-icc-ink">ICC ONLINE</strong>{" "}
            regroupe toutes les personnes désirant appartenir à la grande famille
            Impact Centre Chrétien mais n’ayant pas de campus physique à
            proximité de chez elles.
          </p>
          <p>
            Notre vision : offrir un espace chaleureux pour partager la foi,
            suivre les cultes, grandir dans la Parole, prier ensemble et
            s’encourager — où que vous soyez dans le monde.
          </p>
          <p>
            Les{" "}
            <strong className="font-semibold text-icc-ink">
              FIO (Familles d’Impact Online)
            </strong>{" "}
            sont le cœur de cette communauté : de petits groupes pour vivre la
            fraternité, l’accompagnement et l’impact au quotidien.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button href={getWpLoginUrl()} variant="primary">
            Je me connecte
          </Button>
          <Button href="/contact" variant="ghost">
            Nous contacter
          </Button>
        </div>
      </div>
    </div>
  );
}
