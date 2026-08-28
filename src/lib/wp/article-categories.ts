import { wpFetch } from "./client";

export type ArticleCategory = {
  id: number;
  name: string;
  slug: string;
};

type WpCategory = {
  id: number;
  name: string;
  slug: string;
};

export async function getArticleCategories(): Promise<ArticleCategory[]> {
  const categories = await wpFetch<WpCategory[]>(
    "/wp/v2/categories?per_page=100&orderby=name&order=asc&_fields=id,name,slug",
    { revalidate: 3600, tags: ["wp-categories"] },
  );

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));
}

export function isAllowedCategoryId(
  categories: ArticleCategory[],
  categoryId: number,
): boolean {
  return categories.some((c) => c.id === categoryId);
}
