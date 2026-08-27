import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { DownloadResources } from "@/components/blog/DownloadResources";
import { PostContent } from "@/components/blog/PostContent";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { YouTubeEmbed } from "@/components/blog/YouTubeEmbed";
import { formatDate } from "@/lib/utils/dates";
import {
  getAllPostSlugs,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/wp/posts";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  try {
    const slugs = await getAllPostSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const post = await getPostBySlug(slug).catch(() => null);
  if (!post) {
    return { title: t("notFoundTitle") };
  }

  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified,
      images: post.featuredImage?.url
        ? [{ url: post.featuredImage.url }]
        : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const post = await getPostBySlug(slug).catch(() => null);
  if (!post) notFound();

  const related = await getRelatedPosts(post, 3).catch(() => []);

  return (
    <article className="bg-white py-12 md:py-16">
      <div className="container-icc max-w-3xl">
        <header>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-icc-coral">
            {post.category ? <span>{post.category.name}</span> : null}
            <span className="font-medium normal-case tracking-normal text-icc-muted">
              {post.readingTimeLabel}
            </span>
          </div>

          <h1 className="mt-4 text-[clamp(2rem,5.5vw,3.4rem)] font-extrabold leading-[1.1] tracking-tight text-icc-ink">
            {post.title}
          </h1>

          <p className="mt-5 text-sm text-icc-muted md:text-base">
            {t("by")}{" "}
            <span className="font-medium text-icc-ink">{post.authorName}</span>
            {" · "}
            {formatDate(post.date, locale)}
          </p>
        </header>

        {post.featuredImage ? (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden bg-icc-cream">
            <Image
              src={post.featuredImage.url}
              alt={post.featuredImage.alt}
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 768px"
              priority
            />
          </div>
        ) : null}

        {post.youtubeUrl ? (
          <YouTubeEmbed url={post.youtubeUrl} title={post.title} />
        ) : null}

        <div className="mt-10">
          <PostContent html={post.contentHtml} />
        </div>

        <DownloadResources attachments={post.attachments} />
        <RelatedPosts posts={related} locale={locale} />
      </div>
    </article>
  );
}
