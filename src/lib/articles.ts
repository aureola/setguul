import { prisma } from "@/lib/prisma";
import { extractFirstImageSrc } from "@/lib/content-image";

export function articleListSelect() {
  return {
    id: true,
    numericId: true,
    title: true,
    slug: true,
    excerpt: true,
    coverImage: true,
    publishedAt: true,
    viewCount: true,
    commentsEnabled: true,
    categories: { select: { slug: true, nameMn: true } },
    author: { select: { name: true } },
  } as const;
}

function withThumbnailFallback<T extends { coverImage: string | null; content: string }>(
  article: T,
): Omit<T, "content"> {
  const { content, ...rest } = article;
  return { ...rest, coverImage: article.coverImage ?? extractFirstImageSrc(content) };
}

export async function getFeaturedArticle() {
  const article = await prisma.article.findFirst({
    where: { status: "PUBLISHED", isFeatured: true },
    orderBy: { publishedAt: "desc" },
    select: { ...articleListSelect(), content: true },
  });
  return article ? withThumbnailFallback(article) : null;
}

export async function getLatestArticles(take = 8, skip = 0) {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take,
    skip,
    select: { ...articleListSelect(), content: true },
  });
  return articles.map(withThumbnailFallback);
}

export async function getMenuCategoriesWithArticles(menuItems: { url: string }[]) {
  const categorySlugs = [
    ...new Set(
      menuItems.flatMap((item) => {
        const match = item.url.match(/^\/category\/([^/?#]+)\/?$/);
        return match ? [match[1]] : [];
      }),
    ),
  ];

  if (categorySlugs.length === 0) return [];

  const categories = await prisma.category.findMany({
    where: { slug: { in: categorySlugs } },
    select: {
      slug: true,
      nameMn: true,
      articles: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 4,
        select: { ...articleListSelect(), content: true },
      },
    },
  });
  const categoriesBySlug = new Map(
    categories.map((category) => [category.slug, category] as const),
  );
  const addedSlugs = new Set<string>();

  return menuItems.flatMap((item) => {
    const match = item.url.match(/^\/category\/([^/?#]+)\/?$/);
    if (!match || addedSlugs.has(match[1])) return [];

    const category = categoriesBySlug.get(match[1]);
    if (!category || category.articles.length === 0) return [];

    addedSlugs.add(category.slug);
    return [{
      ...category,
      articles: category.articles.map(withThumbnailFallback),
    }];
  });
}

export async function getArticlesByCategory(categorySlug: string, take = 20, skip = 0) {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", categories: { some: { slug: categorySlug } } },
    orderBy: { publishedAt: "desc" },
    take,
    skip,
    select: { ...articleListSelect(), content: true },
  });
  return articles.map(withThumbnailFallback);
}

export async function countArticlesByCategory(categorySlug: string) {
  return prisma.article.count({
    where: { status: "PUBLISHED", categories: { some: { slug: categorySlug } } },
  });
}

export async function getArticlesByAuthor(authorId: string, take = 40, skip = 0) {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", authorId },
    orderBy: { publishedAt: "desc" },
    take,
    skip,
    select: { ...articleListSelect(), content: true },
  });
  return articles.map(withThumbnailFallback);
}

export async function getArticleByIdentifier(identifier: string) {
  const isNumeric = /^\d+$/.test(identifier);
  return prisma.article.findFirst({
    where: isNumeric
      ? { status: "PUBLISHED", OR: [{ numericId: Number(identifier) }, { slug: identifier }] }
      : { status: "PUBLISHED", slug: identifier },
    select: {
      ...articleListSelect(),
      content: true,
    },
  });
}

export async function getSidebarArticles(excludeId: string, take = 20) {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", id: { not: excludeId } },
    orderBy: { publishedAt: "desc" },
    take,
    select: { ...articleListSelect(), content: true },
  });
  return articles.map(withThumbnailFallback);
}

export async function searchArticles(query: string, take = 20) {
  if (!query.trim()) return [];
  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query } },
        { excerpt: { contains: query } },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take,
    select: { ...articleListSelect(), content: true },
  });
  return articles.map(withThumbnailFallback);
}

export async function incrementViewCount(id: string) {
  await prisma.article.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => null);
}
