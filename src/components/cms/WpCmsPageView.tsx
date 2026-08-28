import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { MagazineShowcase } from "@/components/cms/MagazineShowcase";
import { WpContentLocaleNotice } from "@/components/cms/WpContentLocaleNotice";
import { WpFormEmbed } from "@/components/cms/WpFormEmbed";
import { PostContent } from "@/components/blog/PostContent";
import { isDefaultWpContentLocale } from "@/lib/wp/content-locale";
import type { CmsPageMessageKey } from "@/lib/wp/page-config";
import type { CmsPage, IccPageDownload } from "@/lib/wp/types";

type Props = {
  page: CmsPage;
  messageKey: CmsPageMessageKey;
  locale?: string;
};

function formatFilesize(bytes?: number | string): string | null {
  const n = typeof bytes === "string" ? Number(bytes) : bytes;
  if (!n || n <= 0 || Number.isNaN(n)) return null;
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} Ko`;
  return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
}

async function CmsDownloads({ downloads }: { downloads: IccPageDownload[] }) {
  if (!downloads.length) return null;
  const t = await getTranslations("wpPages");

  return (
    <aside className="rounded-xl border border-black/8 bg-icc-cream/40 px-5 py-6 md:px-6">
      <h2 className="text-lg font-bold tracking-tight text-icc-ink">
        {t("downloadsTitle")}
      </h2>
      <ul className="mt-4 space-y-3">
        {downloads.map((file, index) => {
          const ext = (file.extension || "PDF").toUpperCase();
          const size = formatFilesize(file.filesize);
          return (
            <li key={`${file.url}-${index}`}>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 text-icc-ink transition hover:text-icc-coral"
              >
                <span className="inline-flex h-9 min-w-9 items-center justify-center border border-icc-coral/40 px-1.5 text-[10px] font-bold tracking-wide text-icc-coral">
                  {ext}
                </span>
                <span>
                  <span className="font-medium underline-offset-4 group-hover:underline">
                    {file.title}
                  </span>
                  {size ? (
                    <span className="ml-2 text-sm font-normal text-icc-muted">
                      ({size})
                    </span>
                  ) : null}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function isFormOnlyPage(page: CmsPage, messageKey: CmsPageMessageKey): boolean {
  return (
    page.embeds.length > 0 &&
    !page.magazine &&
    !page.featuredImage &&
    !page.introHtml.trim()
  );
}

export async function WpCmsPageView({
  page,
  messageKey,
  locale = "fr",
}: Props & { locale?: string }) {
  const t = await getTranslations("wpPages");
  const eyebrow = t(`${messageKey}.eyebrow`);
  const fallbackTitle = t(`${messageKey}.title`);
  const localizedDescription = t(`${messageKey}.description`);
  const formOnly = isFormOnlyPage(page, messageKey);
  const introHtml = isDefaultWpContentLocale(locale)
    ? page.introHtml
    : localizedDescription;

  if (formOnly) {
    return (
      <div className="bg-white">
        {page.embeds.map((embed, index) => (
          <WpFormEmbed
            key={`${embed.src}-${index}`}
            embed={embed}
            autoResize
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="container-icc max-w-4xl">
        <header className="mb-8 md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3.2rem)] font-extrabold tracking-tight text-icc-ink">
            {page.title || fallbackTitle}
          </h1>
        </header>

        {page.featuredImage ? (
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl bg-icc-cream md:mb-10">
            <Image
              src={page.featuredImage.url}
              alt={page.featuredImage.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
            />
          </div>
        ) : null}

        {page.magazine ? (
          <MagazineShowcase magazine={page.magazine} />
        ) : null}

        {page.introHtml && !page.magazine ? (
          <div className="mb-8 md:mb-10">
            <WpContentLocaleNotice locale={locale} namespace="wpPages" />
            <PostContent html={introHtml} />
          </div>
        ) : !page.magazine && !isDefaultWpContentLocale(locale) ? (
          <div className="mb-8 md:mb-10">
            <WpContentLocaleNotice locale={locale} namespace="wpPages" />
            <p className="text-base leading-relaxed text-icc-muted md:text-lg">
              {localizedDescription}
            </p>
          </div>
        ) : null}

        {page.embeds.length > 0 ? (
          <div className="space-y-6">
            {page.embeds.map((embed, index) => (
              <WpFormEmbed key={`${embed.src}-${index}`} embed={embed} />
            ))}
          </div>
        ) : null}

        {page.downloads.length > 0 && !page.magazine ? (
          <div className="mt-8">
            <CmsDownloads downloads={page.downloads} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
