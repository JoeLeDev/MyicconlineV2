import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/wp/types";
import { formatFrDate } from "@/lib/utils/dates";

type Props = {
  posts: BlogPost[];
};

export function RelatedPosts({ posts }: Props) {
  if (!posts.length) return null;

  return (
    <section className="mt-16 border-t border-black/10 pt-12">
      <h2 className="text-2xl font-bold tracking-tight text-icc-ink">
        À lire ensuite
      </h2>
      <div className="mt-8 grid gap-8 md:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group block"
          >
            <div className="relative mb-4 aspect-[16/10] overflow-hidden bg-icc-cream">
              {post.featuredImage ? (
                <Image
                  src={post.featuredImage.url}
                  alt={post.featuredImage.alt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-icc-warm-brown/30 to-icc-coral/25" />
              )}
            </div>
            {post.category ? (
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-icc-coral">
                {post.category.name}
              </p>
            ) : null}
            <h3 className="mt-1 text-lg font-bold leading-snug text-icc-ink transition group-hover:text-icc-coral-deep">
              {post.title}
            </h3>
            <p className="mt-1 text-sm text-icc-muted">
              {formatFrDate(post.date)} · {post.readingTimeMinutes} min
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
