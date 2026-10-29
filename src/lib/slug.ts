import slugify from "slugify";
import { prisma } from "@/lib/prisma";

export async function uniqueArticleSlug(title: string, ignoreId?: string): Promise<string> {
  const base = slugify(title, { lower: true, strict: true }) || "medee";
  let slug = base;
  let i = 1;
  while (
    await prisma.article.findFirst({
      where: { slug, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
      select: { id: true },
    })
  ) {
    i += 1;
    slug = `${base}-${i}`;
  }
  return slug;
}
