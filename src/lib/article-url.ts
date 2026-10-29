export function getArticlePath(article: { slug: string; numericId: number }, mode: string): string {
  return mode === "id" ? `/news/${article.numericId}` : `/news/${article.slug}`;
}
