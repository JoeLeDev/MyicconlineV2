import type { Metadata } from "next";
import { ConnectedFamily } from "@/components/home/ConnectedFamily";
import { Hero } from "@/components/home/Hero";
import { JoinCommunity } from "@/components/home/JoinCommunity";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "Bienvenue à ICC Online — le campus digital d’Impact Centre Chrétien. Une famille connectée pour vivre la foi ensemble.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <ConnectedFamily />
      <JoinCommunity />
    </>
  );
}
