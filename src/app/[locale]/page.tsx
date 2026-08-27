import { getTranslations, setRequestLocale } from "next-intl/server";
import { ConnectedFamily } from "@/components/home/ConnectedFamily";
import { Hero } from "@/components/home/Hero";
import { JoinCommunity } from "@/components/home/JoinCommunity";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: t("heroTitleLine2"),
    description: t("heroSubtitle"),
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <ConnectedFamily />
      <JoinCommunity />
    </>
  );
}
