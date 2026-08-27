import { Button } from "@/components/ui/Button";
import { getWpLoginUrl } from "@/lib/wp/config";

const HERO_IMAGE =
  "https://myicconline.com/wp-content/uploads/2025/09/iStock-1479493670-scaled.webp";

export function Hero() {
  return (
    <section className="relative flex min-h-[88vh] items-end overflow-hidden bg-icc-black pb-16 pt-28 md:items-center md:pb-24 md:pt-32">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,.62) 0%, rgba(20,12,10,.45) 45%, rgba(0,0,0,.72) 100%)",
        }}
        aria-hidden
      />

      <div className="container-icc relative z-10 max-w-3xl text-white">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/75 animate-[fadeUp_.7s_ease_both]">
          Impact Centre Chrétien
        </p>
        <h1 className="text-[clamp(2.4rem,7vw,4.6rem)] font-extrabold leading-[1.05] tracking-tight animate-[fadeUp_.8s_ease_.05s_both]">
          Bienvenue à
          <br />
          <span className="text-white">ICC ONLINE</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-white/90 md:text-lg animate-[fadeUp_.85s_ease_.1s_both]">
          Découvrez notre vision, nos programmes en rejoignant une communauté
          dynamique et engagée.
        </p>
        <div className="mt-8 animate-[fadeUp_.9s_ease_.15s_both]">
          <Button href={getWpLoginUrl()} variant="outline">
            Je me connecte
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
