import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";

const MAP_SRC =
  "https://myicconline.com/wp-content/uploads/2025/09/Carte-1.webp";

export async function ConnectedFamily() {
  const t = await getTranslations("home");

  return (
    <section className="bg-icc-cream py-16 md:py-24">
      <div className="container-icc">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div className="max-w-xl">
            <h2 className="text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold tracking-tight text-icc-ink">
              {t("familyTitle")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-icc-muted md:text-lg">
              {t("familyText")}
            </p>
            <div className="mt-8">
              <Button href="/connexion" variant="ghost">
                {t("familyCta")}
              </Button>
            </div>
          </div>

          <div className="relative w-full max-w-lg">
            <div
              className="absolute -inset-6 rounded-full opacity-80 blur-2xl"
              style={{
                background:
                  "radial-gradient(circle at 40% 40%, rgba(24,148,190,.35), rgba(24,148,190,.12) 45%, transparent 70%)",
              }}
              aria-hidden
            />
            <Image
              src={MAP_SRC}
              alt={t("familyMapAlt")}
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
