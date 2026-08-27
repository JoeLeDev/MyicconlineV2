import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { getWpLoginUrl } from "@/lib/wp/config";

const BG =
  "https://myicconline.com/wp-content/uploads/2025/09/iStock-1479493670-scaled.webp";

export async function JoinCommunity() {
  const t = await getTranslations("home");

  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG})` }}
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1000px 520px at 18% 50%, rgba(24,148,190,.42), transparent), rgba(12,8,6,.62)",
        }}
        aria-hidden
      />

      <div className="container-icc relative z-10 max-w-2xl py-20 text-white">
        <h2 className="text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold tracking-tight">
          {t("joinTitleLine1")}
          <br />
          {t("joinTitleLine2")}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-white/90 md:text-lg">
          {t("joinText")}
        </p>
        <div className="mt-8">
          <Button
            href={`${getWpLoginUrl().replace(/\/$/, "")}/register/`}
            variant="light"
          >
            {t("joinCta")}
          </Button>
        </div>
      </div>
    </section>
  );
}
