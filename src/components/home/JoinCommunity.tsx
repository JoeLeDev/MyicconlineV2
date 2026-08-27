import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { getWpLoginUrl } from "@/lib/wp/config";

const BG =
  "https://myicconline.com/wp-content/uploads/2025/09/iStock-1479493670-scaled.webp";

export async function JoinCommunity() {
  const t = await getTranslations("home");

  return (
    <section className="relative flex min-h-[min(70svh,36rem)] items-center overflow-hidden md:min-h-[70vh]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG})` }}
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 480px at 18% 50%, rgba(24,148,190,.42), transparent), rgba(12,8,6,.66)",
        }}
        aria-hidden
      />

      <div className="container-icc relative z-10 max-w-2xl py-16 text-white md:py-20">
        <h2 className="text-[clamp(1.55rem,5.5vw,2.5rem)] font-bold tracking-tight">
          {t("joinTitleLine1")}
          <br />
          {t("joinTitleLine2")}
        </h2>
        <p className="mt-4 text-[0.98rem] leading-relaxed text-white/90 md:text-lg">
          {t("joinText")}
        </p>
        <div className="mt-7 md:mt-8">
          <Button
            href={`${getWpLoginUrl().replace(/\/$/, "")}/register/`}
            variant="light"
            className="w-full min-h-11 sm:w-auto sm:min-w-[14rem]"
          >
            {t("joinCta")}
          </Button>
        </div>
      </div>
    </section>
  );
}
