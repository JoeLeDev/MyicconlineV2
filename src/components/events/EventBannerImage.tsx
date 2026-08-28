type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  /** full = image entière (page détail) ; cover = cadre 16:9 rogné (liste) ; contain = image entière dans un cadre */
  layout?: "full" | "cover" | "contain";
};

/** Bannières WP servies directement (sans next/image) pour fiabilité des URLs externes. */
export function EventBannerImage({
  src,
  alt,
  className = "",
  priority = false,
  layout = "full",
}: Props) {
  const layoutClass =
    layout === "cover"
      ? "absolute inset-0 h-full w-full object-cover"
      : layout === "contain"
        ? "block h-full w-full object-contain object-center"
        : "block h-auto w-full";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      className={[layoutClass, className].join(" ")}
    />
  );
}
