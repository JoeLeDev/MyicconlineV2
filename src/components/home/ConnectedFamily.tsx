import Image from "next/image";
import { Button } from "@/components/ui/Button";

const MAP_SRC =
  "https://myicconline.com/wp-content/uploads/2025/09/Carte-1.webp";

export function ConnectedFamily() {
  return (
    <section className="bg-icc-cream py-16 md:py-24">
      <div className="container-icc">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div className="max-w-xl">
            <h2 className="text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold tracking-tight text-icc-ink">
              Une famille connectée
            </h2>
            <p className="mt-4 text-base leading-relaxed text-icc-muted md:text-lg">
              Impact Centre Chrétien en ligne est la dimension digitale des
              églises Impact Centre Chrétien. Campus à part entière, ICC ONLINE
              regroupe toutes les personnes désirant appartenir à la grande
              famille Impact Centre Chrétien mais n’ayant pas de campus physique
              à proximité de chez elles.
            </p>
            <div className="mt-8">
              <Button href="/connexion" variant="ghost">
                Je me connecte
              </Button>
            </div>
          </div>

          <div className="relative w-full max-w-lg">
            <div
              className="absolute -inset-6 rounded-full opacity-80 blur-2xl"
              style={{
                background:
                  "radial-gradient(circle at 40% 40%, rgba(255,91,83,.35), rgba(229,91,72,.12) 45%, transparent 70%)",
              }}
              aria-hidden
            />
            <Image
              src={MAP_SRC}
              alt="Carte des implantations ICC Online"
              width={1040}
              height={720}
              className="relative h-auto w-full"
              sizes="(max-width: 768px) 100vw, 520px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
