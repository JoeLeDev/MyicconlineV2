import { Button } from "@/components/ui/Button";
import { getWpLoginUrl } from "@/lib/wp/config";

const HERO_VIDEO =
  "https://myicconline.com/wp-content/themes/network-child/assets/video1.mp4";

export function Hero() {
  return (
    <section className="relative flex min-h-[77vh] items-center overflow-hidden bg-icc-black pb-16 pt-28 md:min-h-[88vh] md:pb-24 md:pt-32">
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>

      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.25) 45%, rgba(0,0,0,.55) 100%)",
        }}
        aria-hidden
      />

      <div className="container-icc relative z-10 max-w-3xl text-white">
        <h1 className="text-[clamp(2.25rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight animate-[fadeUp_.8s_ease_both]">
          Bienvenue à
          <br />
          ICC ONLINE
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/92 md:text-lg animate-[fadeUp_.85s_ease_.05s_both]">
          Découvrez notre vision, nos programmes en rejoignant une communauté
          dynamique et engagée.
        </p>
        <div className="mt-8 animate-[fadeUp_.9s_ease_.1s_both]">
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
