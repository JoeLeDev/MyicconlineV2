import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PostCard } from "@/components/blog/PostCard";
import { Link } from "@/i18n/navigation";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPosts } from "@/lib/wp/posts";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return buildPageMetadata({
    locale,
    href: "/blog",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);

  let posts: Awaited<ReturnType<typeof getPosts>>["posts"] = [];
  let totalPages = 1;
  let error: string | null = null;

  try {
    const result = await getPosts({ page, perPage: 10 });
    posts = result.posts;
    totalPages = result.totalPages || 1;
  } catch {
    error = t("error");
  }

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="container-icc max-w-4xl">
        <header className="mb-10 md:mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3.2rem)] font-extrabold tracking-tight text-icc-ink">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-xl text-base text-icc-muted md:text-lg">
            {t("subtitle")}
          </p>
        </header>

        {error ? (
          <p className="rounded-lg border border-icc-coral/30 bg-icc-cream px-4 py-3 text-sm text-icc-ink">
            {error}
          </p>
        ) : null}

        {!error && posts.length === 0 ? (
          <p className="text-icc-muted">{t("empty")}</p>
        ) : null}

        <div>
          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              featured={page === 1 && index === 0}
              locale={locale}
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
                {t("prev")}
              </Link>
            ) : (
              <span />
            )}
            <span className="text-icc-muted">
              {t("page", { page, total: totalPages })}
            </span>
            {page < totalPages ? (
              <Link
                href={`/blog?page=${page + 1}`}
                className="text-icc-coral hover:text-icc-coral-deep"
              >
                {t("next")}
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
