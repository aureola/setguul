import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import ArticleListClient from "@/components/admin/ArticleListClient";
import ArticleFilters from "@/components/admin/ArticleFilters";
import PageHeader from "@/components/admin/ui/PageHeader";
import { buttonPrimaryClass } from "@/components/admin/ui/styles";

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; author?: string; from?: string; to?: string }>;
}) {
  const session = await auth();
  const role = session!.user.role;
  const userId = session!.user.id;
  const canSeeAllAuthors = hasPermission(role, "article.editAny");

  const { q, author, from, to } = await searchParams;

  const where: Prisma.ArticleWhereInput = canSeeAllAuthors ? {} : { authorId: userId };
  if (canSeeAllAuthors && author) {
    where.authorId = author;
  }
  if (q) {
    where.title = { contains: q };
  }
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(`${from}T00:00:00`) } : {}),
      ...(to ? { lte: new Date(`${to}T23:59:59.999`) } : {}),
    };
  }

  const [articles, authors] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        categories: { select: { nameMn: true } },
        author: { select: { name: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Мэдээ"
        description="Нийт нийтлэл, ноорог болон нийтэлсэн мэдээг удирдах"
        action={
          <Link href="/admin/articles/new" className={buttonPrimaryClass}>
            + Мэдээ нэмэх
          </Link>
        }
      />
      <ArticleFilters authors={authors} />
      <ArticleListClient
        articles={articles.map((a) => ({
          id: a.id,
          numericId: a.numericId,
          title: a.title,
          status: a.status,
          createdAt: a.createdAt.toISOString(),
          viewCount: a.viewCount,
          commentCount: a._count.comments,
          categories: a.categories,
          author: a.author,
        }))}
      />
    </div>
  );
}
