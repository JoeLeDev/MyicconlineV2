import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { WpFio } from "@/lib/wp/community-types";

type Props = {
  fio: WpFio;
};

function isPlaceholder(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return !normalized || normalized === "non défini" || normalized === "non renseigné";
}

export async function FioCard({ fio }: Props) {
  const t = await getTranslations("community");
  const schedule = [fio.jour, fio.horaire].filter((v) => !isPlaceholder(v)).join(" · ");

  return (
    <Link
      href={`/groupes/${fio.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-black/8 bg-white transition hover:border-icc-coral/30 hover:shadow-sm"
    >
      <div className="relative aspect-[16/9] bg-icc-cream">
        {fio.image ? (
          <Image
            src={fio.image}
            alt={fio.nom}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-icc-warm-brown/35 to-icc-coral/25" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-bold tracking-tight text-icc-ink group-hover:text-icc-coral">
          {fio.nom}
        </h2>
        {fio.description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-icc-muted">
            {fio.description}
          </p>
        ) : null}
        <div className="mt-auto space-y-1 pt-4 text-sm text-icc-muted">
          {schedule ? <p>{schedule}</p> : null}
          {!isPlaceholder(fio.pilote) ? (
            <p>{t("pilot", { name: fio.pilote })}</p>
          ) : null}
          <p>{t("membersCountShort", { count: fio.membres })}</p>
        </div>
      </div>
    </Link>
  );
}
