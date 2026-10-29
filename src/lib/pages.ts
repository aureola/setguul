import { prisma } from "@/lib/prisma";
import { sanitizeArticleHtml } from "@/lib/sanitize";

export async function getPageBySlug(slug: string) {
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return null;
  return { ...page, content: sanitizeArticleHtml(page.content) };
}

export async function getFooterPages() {
  return prisma.page.findMany({
    where: { showInFooter: true },
    orderBy: { order: "asc" },
    select: { title: true, slug: true },
  });
}
