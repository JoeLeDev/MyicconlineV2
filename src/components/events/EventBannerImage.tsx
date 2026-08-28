type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  /** full = image entière (page détail) ; frame = cadre liste sans rognage */
  layout?: "full" | "frame";
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
    layout === "frame"
      ? "max-h-full max-w-full object-contain"
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
