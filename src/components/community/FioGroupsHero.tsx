import { getTranslations } from "next-intl/server";
import { EventBannerImage } from "@/components/events/EventBannerImage";
import { FIO_GROUPS_PAGE_HERO_IMAGE } from "@/lib/wp/fio-assets";

export async function FioGroupsHero() {
  const t = await getTranslations("community");

  return (
    <section className="relative min-h-[min(52vh,28rem)] overflow-hidden md:min-h-[55vh]">
      <EventBannerImage
        src={FIO_GROUPS_PAGE_HERO_IMAGE}
        alt=""
        layout="cover"
        priority
        className="absolute inset-0 h-full w-full"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-icc-ink/85 via-icc-ink/55 to-icc-ink/25 md:from-icc-ink/75 md:via-icc-ink/45 md:to-icc-ink/10"
        aria-hidden
      />

      <div className="container-icc relative z-10 flex min-h-[min(52vh,28rem)] max-w-3xl flex-col justify-center py-16 pb-28 text-white md:min-h-[55vh] md:py-20 md:pb-36">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-icc-coral-hot">
          {t("groupsEyebrow")}
        </p>
        <h1 className="mt-3 text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.08] tracking-tight">
          {t("groupsHeroTitle")}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/88 md:text-lg">
          {t("groupsHeroSubtitle")}
        </p>
      </div>
    </section>
  );
}
