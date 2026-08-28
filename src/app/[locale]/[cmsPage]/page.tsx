import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { WpCmsPageView } from "@/components/cms/WpCmsPageView";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { routing } from "@/i18n/routing";
import {
  CMS_PAGE_ROUTES,
  getCmsPageConfig,
  isCmsPageRoute,
} from "@/lib/wp/page-config";
import { getCmsPageByRoute } from "@/lib/wp/pages";

export const revalidate = 300;

type Props = {
  params: Promise<{ locale: string; cmsPage: string }>;
};

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    CMS_PAGE_ROUTES.map((cmsPage) => ({ locale, cmsPage })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, cmsPage } = await params;
  const config = getCmsPageConfig(cmsPage);
  if (!config) return {};

  const t = await getTranslations({ locale, namespace: "wpPages" });
  const page = await getCmsPageByRoute(cmsPage).catch(() => null);

  const title = page?.title || t(`${config.messageKey}.title`);
  const description = t(`${config.messageKey}.description`);

  return buildPageMetadata({
    locale,
    href: `/${cmsPage}`,
    title,
    description,
    images: page?.featuredImage?.url ? [page.featuredImage.url] : undefined,
  });
}

export default async function CmsDynamicPage({ params }: Props) {
  const { locale, cmsPage } = await params;
  setRequestLocale(locale);

  if (!isCmsPageRoute(cmsPage)) {
    notFound();
  }

  const config = getCmsPageConfig(cmsPage)!;
  const page = await getCmsPageByRoute(cmsPage).catch(() => null);
  if (!page) {
    notFound();
  }

  return (
    <WpCmsPageView
      page={page}
      messageKey={config.messageKey}
      locale={locale}
    />
  );
}
