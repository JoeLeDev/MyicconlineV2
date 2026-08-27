import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "ICC Online — Impact Centre Chrétien",
    template: "%s · ICC Online",
  },
  description:
    "ICC Online, le campus digital d’Impact Centre Chrétien. Une famille connectée pour vivre la foi, la prière et la communauté où que vous soyez.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "ICC Online",
    title: "ICC Online — Impact Centre Chrétien",
    description:
      "Campus digital d’Impact Centre Chrétien. Rejoignez une famille connectée.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ICC Online",
    description:
      "Campus digital d’Impact Centre Chrétien. Rejoignez une famille connectée.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white font-sans text-icc-ink">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
