import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import type { IccPageMagazine } from "@/lib/wp/types";

type Props = {
  magazine: IccPageMagazine;
};

export async function MagazineShowcase({ magazine }: Props) {
  const t = await getTranslations("wpPages");
  const title = magazine.title?.trim() || t("magazine.title");
  const edition = magazine.edition?.trim();
  const intro = magazine.intro?.trim();
  const coverUrl = magazine.cover_url?.trim();
  const pdfUrl = magazine.pdf_url?.trim();
  const pages = (magazine.pages || []).filter(Boolean);

  return (
    <section className="space-y-10" aria-labelledby="magazine-showcase-title">
      <div className="grid gap-8 rounded-xl border border-black/8 bg-icc-cream/40 p-6 md:grid-cols-[minmax(0,14rem)_1fr] md:items-start md:p-8">
        {coverUrl ? (
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[14rem] overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5">
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 60vw, 224px"
              priority
            />
          </div>
        ) : null}

        <div className="min-w-0">
          {edition ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
              {edition}
            </p>
          ) : null}
          <h2
            id="magazine-showcase-title"
            className="mt-2 text-[clamp(1.5rem,4vw,2.25rem)] font-bold tracking-tight text-icc-ink"
          >
            {title}
          </h2>
          {intro ? (
            <p className="mt-4 text-base leading-relaxed text-icc-muted md:text-lg">
              {intro}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {pages.length > 0 ? (
              <Button href="#icc-mag-reader" variant="primary" className="w-full sm:w-auto">
                {t("readOnSite")}
              </Button>
            ) : null}
            {pdfUrl ? (
              <Button href={pdfUrl} variant="ghost" external className="w-full sm:w-auto">
                {t("downloadPdf")}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {pages.length > 0 ? (
        <div id="icc-mag-reader" className="scroll-mt-24">
          <h3 className="text-lg font-bold tracking-tight text-icc-ink md:text-xl">
            {t("readerTitle")}
          </h3>
          <div className="mt-6 space-y-6">
            {pages.map((pageUrl, index) => (
              <figure
                key={`${pageUrl}-${index}`}
                className="overflow-hidden rounded-xl border border-black/8 bg-white"
              >
                <Image
                  src={pageUrl}
                  alt={`${title} — ${t("pageLabel", { page: index + 1 })}`}
                  width={1200}
                  height={1600}
                  className="h-auto w-full"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </figure>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
