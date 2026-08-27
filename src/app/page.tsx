import type { Metadata } from "next";
import Link from "next/link";
import { ConnectedFamily } from "@/components/home/ConnectedFamily";
import { Hero } from "@/components/home/Hero";
import { JoinCommunity } from "@/components/home/JoinCommunity";
import { PostCard } from "@/components/blog/PostCard";
import { getPosts } from "@/lib/wp/posts";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "Bienvenue à ICC Online — le campus digital d’Impact Centre Chrétien. Une famille connectée pour vivre la foi ensemble.",
};

export default async function HomePage() {
  let latestPosts: Awaited<ReturnType<typeof getPosts>>["posts"] = [];
  try {
    const result = await getPosts({ perPage: 3 });
    latestPosts = result.posts;
  } catch {
    latestPosts = [];
  }

  return (
    <>
      <Hero />
      <ConnectedFamily />
      <JoinCommunity />

      {latestPosts.length > 0 ? (
        <section className="bg-white py-16 md:py-20">
          <div className="container-icc">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
                  Blog
                </p>
                <h2 className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)] font-bold tracking-tight">
                  À la une
                </h2>
              </div>
              <Link
                href="/blog"
                className="text-sm font-semibold text-icc-coral hover:text-icc-coral-deep"
              >
                Voir tous les articles
              </Link>
            </div>
            <div>
              {latestPosts.map((post, index) => (
                <PostCard key={post.id} post={post} featured={index === 0} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
