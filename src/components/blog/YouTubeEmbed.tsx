import { toYoutubeEmbedUrl } from "@/lib/utils/html";

type Props = {
  url: string;
  title?: string;
};

export function YouTubeEmbed({ url, title = "Vidéo YouTube" }: Props) {
  const embed = toYoutubeEmbedUrl(url);
  if (!embed) return null;

  return (
    <div className="my-10 overflow-hidden bg-icc-black">
      <div className="relative aspect-video w-full">
        <iframe
          src={embed}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}
