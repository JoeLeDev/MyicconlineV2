import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { CommunityNav } from "@/components/layout/CommunityNav";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { routing } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildOrganizationSchema } from "@/lib/seo/schemas";
import { SITE_LOGO } from "@/lib/site";
import { getSiteUrl } from "@/lib/site-url";
import "../globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = `${t("siteName")} — Impact Centre Chrétien`;
  const pageMeta = buildPageMetadata({
    locale,
    href: "/",
    title,
    description: t("defaultDescription"),
    images: [SITE_LOGO],
  });

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: title,
      template: `%s · ${t("siteName")}`,
    },
    description: pageMeta.description,
    alternates: pageMeta.alternates,
    openGraph: pageMeta.openGraph,
    twitter: pageMeta.twitter,
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white font-sans text-icc-ink">
        <JsonLd data={buildOrganizationSchema()} />
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Header />
            <CommunityNav />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
