import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";

const MAP_SRC =
  "https://myicconline.com/wp-content/uploads/2025/09/Carte-1.webp";

export async function ConnectedFamily() {
  const t = await getTranslations("home");

  return (
    <section className="bg-icc-cream py-14 md:py-24">
      <div className="container-icc">
        <div className="flex flex-col items-stretch gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div className="max-w-xl">
            <h2 className="text-[clamp(1.55rem,5.5vw,2.5rem)] font-bold tracking-tight text-icc-ink">
              {t("familyTitle")}
            </h2>
            <p className="mt-4 text-[0.98rem] leading-relaxed text-icc-muted md:text-lg">
              {t("familyText")}
            </p>
            <div className="mt-7 md:mt-8">
              <Button
                href="/connexion"
                variant="ghost"
                className="w-full min-h-11 sm:w-auto"
              >
                {t("familyCta")}
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-lg">
            <div
              className="absolute -inset-4 rounded-full opacity-80 blur-2xl md:-inset-6"
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
