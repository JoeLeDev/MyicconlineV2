import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/wp/types";
import { formatFrDate } from "@/lib/utils/dates";

type Props = {
  post: BlogPost;
  featured?: boolean;
};

export function PostCard({ post, featured = false }: Props) {
  return (
    <article className="group border-b border-black/8 py-8 first:pt-0 last:border-b-0">
      <Link
        href={`/blog/${post.slug}`}
        className={[
          "grid gap-6",
          featured ? "md:grid-cols-[1.15fr_1fr] md:items-center" : "md:grid-cols-[220px_1fr] md:items-start",
        ].join(" ")}
      >
        <div
          className={[
            "relative overflow-hidden bg-icc-cream",
            featured ? "aspect-[16/10] md:aspect-[5/3]" : "aspect-[16/10] md:aspect-[4/3]",
          ].join(" ")}
        >
          {post.featuredImage ? (
            <Image
              src={post.featuredImage.url}
              alt={post.featuredImage.alt}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes={featured ? "(max-width:768px) 100vw, 55vw" : "(max-width:768px) 100vw, 220px"}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-icc-warm-brown/40 to-icc-coral/30" />
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-icc-coral">
            {post.category ? <span>{post.category.name}</span> : null}
            <span className="text-icc-muted normal-case tracking-normal font-medium">
              {formatFrDate(post.date)}
            </span>
            <span className="text-icc-muted normal-case tracking-normal font-medium">
              {post.readingTimeMinutes} min
            </span>
          </div>
          <h2
            className={[
              "mt-2 font-bold tracking-tight text-icc-ink transition group-hover:text-icc-coral-deep",
              featured
                ? "text-[clamp(1.5rem,3vw,2.15rem)] leading-tight"
                : "text-xl md:text-2xl leading-snug",
            ].join(" ")}
          >
            {post.title}
          </h2>
          {post.excerpt ? (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-icc-muted md:text-base">
              {post.excerpt}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
