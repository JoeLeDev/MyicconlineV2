import { EventBannerImage } from "@/components/events/EventBannerImage";
import {
  getCategoryAccentClass,
  type FioCategorySlug,
} from "@/lib/wp/fio-categories";

type Props = {
  image: string;
  name: string;
  category: FioCategorySlug;
  categoryLabel?: string;
  schedule?: string;
};

function getInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toLocaleUpperCase("fr");
}

function getCategoryBannerClass(category: FioCategorySlug): string {
  switch (category) {
    case "on-est-ensemble":
      return "from-violet-600/75 via-violet-500/55 to-violet-400/35";
    case "pilotes-fio":
      return "from-amber-700/75 via-amber-500/55 to-amber-400/35";
    case "other":
      return "from-stone-600/75 via-stone-500/55 to-stone-400/35";
    default:
      return "from-sky-700/75 via-sky-500/55 to-sky-400/35";
  }
}

export function FioCardBanner({
  image,
  name,
  category,
  categoryLabel,
  schedule,
}: Props) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-icc-cream">
      {image ? (
        <EventBannerImage
          src={image}
          alt={name}
          layout="cover"
          className="transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div
          className={[
            "absolute inset-0 flex items-center justify-center bg-gradient-to-br",
            getCategoryBannerClass(category),
          ].join(" ")}
          aria-hidden
        >
          <span className="text-5xl font-extrabold tracking-tight text-white/90 md:text-6xl">
            {getInitial(name)}
          </span>
        </div>
      )}

      {schedule ? (
        <p className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-icc-ink shadow-sm">
          {schedule}
        </p>
      ) : null}

      {!image && categoryLabel ? (
        <span
          className={[
            "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
            getCategoryAccentClass(category),
          ].join(" ")}
        >
          {categoryLabel}
        </span>
      ) : null}
    </div>
  );
}
