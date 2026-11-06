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
  searchParams: Promise<{ q?: string; author?: string; from?: string; to?: string; page?: string }>;
}) {
  const session = await auth();
  const role = session!.user.role;
  const userId = session!.user.id;
  const canSeeAllAuthors = hasPermission(role, "article.editAny");

  const { q, author, from, to, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const pageSize = 50;

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

  const [articles, total, authors] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: {
        categories: { select: { nameMn: true } },
        author: { select: { name: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.article.count({ where }),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (author) params.set("author", author);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("page", String(p));
    return `/admin/articles?${params.toString()}`;
  };

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

      {totalPages > 1 && (
        <div className="mt-6 flex items-center gap-4 text-sm">
          {page > 1 && (
            <a href={pageHref(page - 1)} className="font-semibold text-accent hover:underline">
              ← Өмнөх
            </a>
          )}
          <span className="text-muted">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <a href={pageHref(page + 1)} className="font-semibold text-accent hover:underline">
              Дараах →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
