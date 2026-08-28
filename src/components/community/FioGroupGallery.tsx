import { getTranslations } from "next-intl/server";
import { EventBannerImage } from "@/components/events/EventBannerImage";
import type { FioGalleryImage } from "@/lib/wp/fio-gallery";

type Props = {
  images: FioGalleryImage[];
};

export async function FioGroupGallery({ images }: Props) {
  const t = await getTranslations("community");
  if (images.length === 0) return null;

  return (
    <section className="rounded-2xl border border-black/8 bg-white p-5 md:p-6">
      <h2 className="text-lg font-bold text-icc-ink">{t("groupGalleryTitle")}</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((image) => (
          <div
            key={image.url}
            className="relative aspect-[4/3] overflow-hidden rounded-xl bg-icc-cream"
          >
            <EventBannerImage
              src={image.url}
              alt={image.alt}
              layout="cover"
              className="transition duration-500 hover:scale-[1.03]"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
