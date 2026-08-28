import { getTranslations } from "next-intl/server";

type Props = {
  lat: string;
  lng: string;
  label: string;
};

function parseCoord(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function FioGroupMap({ lat, lng, label }: Props) {
  const t = await getTranslations("community");
  const latitude = parseCoord(lat);
  const longitude = parseCoord(lng);

  if (latitude == null || longitude == null) return null;

  const delta = 0.35;
  const bbox = [
    longitude - delta,
    latitude - delta,
    longitude + delta,
    latitude + delta,
  ].join("%2C");
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  const openUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=8/${latitude}/${longitude}`;

  return (
    <section className="rounded-2xl border border-black/8 bg-white p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-icc-ink">{t("groupMapTitle")}</h2>
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-icc-coral hover:text-icc-coral-deep"
        >
          {t("groupMapOpen")}
        </a>
      </div>
      <p className="mt-1 text-sm text-icc-muted">{label}</p>
      <div className="mt-4 overflow-hidden rounded-xl border border-black/8">
        <iframe
          title={t("groupMapTitle")}
          src={embedUrl}
          className="h-56 w-full"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
    </section>
  );
}
