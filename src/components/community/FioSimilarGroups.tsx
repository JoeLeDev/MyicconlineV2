import { getTranslations } from "next-intl/server";
import { FioCardClient } from "@/components/community/FioCardClient";
import type { WpFio } from "@/lib/wp/community-types";

type Props = {
  fios: WpFio[];
};

export async function FioSimilarGroups({ fios }: Props) {
  const t = await getTranslations("community");
  if (fios.length === 0) return null;

  return (
    <section className="border-t border-black/8 bg-white py-10 md:py-12">
      <div className="container-icc max-w-6xl">
        <h2 className="text-2xl font-extrabold tracking-tight text-icc-ink">
          {t("groupSimilarTitle")}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fios.map((fio) => (
            <FioCardClient key={fio.id} fio={fio} />
          ))}
        </div>
      </div>
    </section>
  );
}
