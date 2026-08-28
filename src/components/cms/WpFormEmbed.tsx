import type { IccPageEmbed } from "@/lib/wp/types";

type Props = {
  embed: IccPageEmbed;
};

export function WpFormEmbed({ embed }: Props) {
  const title = embed.title?.trim() || "Formulaire ICC Online";

  return (
    <div className="overflow-hidden rounded-xl border border-black/8 bg-white">
      <iframe
        src={embed.src}
        title={title}
        className="w-full border-0"
        style={{ height: embed.height || "170vh", minHeight: "32rem" }}
        loading="lazy"
        allow="fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
