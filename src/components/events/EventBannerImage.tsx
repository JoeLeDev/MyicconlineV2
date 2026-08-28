import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/** Bannières WP : chargement direct (sans optimizer) pour éviter les URLs unicode cassées. */
export function EventBannerImage({
  src,
  alt,
  className,
  sizes,
  priority = false,
}: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}
