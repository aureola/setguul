import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import ArticleListClient from "@/components/admin/ArticleListClient";
import PageHeader from "@/components/admin/ui/PageHeader";
import { buttonPrimaryClass } from "@/components/admin/ui/styles";

export default async function ArticlesPage() {
  const session = await auth();
  const role = session!.user.role;
  const userId = session!.user.id;

  const where = hasPermission(role, "article.editAny") ? {} : { authorId: userId };

  const articles = await prisma.article.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      categories: { select: { nameMn: true } },
      author: { select: { name: true } },
      _count: { select: { comments: true } },
    },
  });

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
