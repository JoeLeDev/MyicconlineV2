import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/blog/PostCard";
import { getPosts } from "@/lib/wp/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles, cultes, agendas et ressources de la communauté ICC Online.",
  openGraph: {
    title: "Blog · ICC Online",
    description:
      "Articles, cultes, agendas et ressources de la communauté ICC Online.",
  },
};

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  let posts: Awaited<ReturnType<typeof getPosts>>["posts"] = [];
  let totalPages = 1;
  let error: string | null = null;

  try {
    const result = await getPosts({ page, perPage: 10 });
    posts = result.posts;
    totalPages = result.totalPages || 1;
  } catch {
    error = "Impossible de charger les articles pour le moment.";
  }

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="container-icc max-w-4xl">
        <header className="mb-10 md:mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
            Ressources
          </p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3.2rem)] font-extrabold tracking-tight text-icc-ink">
            Blog
          </h1>
          <p className="mt-3 max-w-xl text-base text-icc-muted md:text-lg">
            Cultes, agendas, encouragements et actualités de la famille ICC
            Online.
          </p>
        </header>

        {error ? (
          <p className="rounded-lg border border-icc-coral/30 bg-icc-cream px-4 py-3 text-sm text-icc-ink">
            {error}
          </p>
        ) : null}

        {!error && posts.length === 0 ? (
          <p className="text-icc-muted">Aucun article publié pour le moment.</p>
        ) : null}

        <div>
          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              featured={page === 1 && index === 0}
            />
          ))}
        </div>

        {totalPages > 1 ? (
          <nav
            className="mt-12 flex items-center justify-between border-t border-black/10 pt-6 text-sm font-semibold"
            aria-label="Pagination"
          >
            {page > 1 ? (
              <Link
                href={page === 2 ? "/blog" : `/blog?page=${page - 1}`}
                className="text-icc-coral hover:text-icc-coral-deep"
              >
                ← Précédent
              </Link>
            ) : (
              <span />
            )}
            <span className="text-icc-muted">
              Page {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={`/blog?page=${page + 1}`}
                className="text-icc-coral hover:text-icc-coral-deep"
              >
                Suivant →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </div>
    </div>
  );
}
