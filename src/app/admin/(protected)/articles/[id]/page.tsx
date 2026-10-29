import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission, canEditArticle } from "@/lib/permissions";
import { getSetting } from "@/lib/settings";
import ArticleForm from "@/components/admin/ArticleForm";
import PageHeader from "@/components/admin/ui/PageHeader";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNumeric = /^\d+$/.test(id);
  const session = await auth();
  const [article, categories, commentsEnabledSetting] = await Promise.all([
    prisma.article.findFirst({
      where: isNumeric ? { numericId: Number(id) } : { id },
      include: { categories: { select: { id: true } }, author: { select: { name: true } } },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    getSetting("comments_enabled"),
  ]);

  if (!article) notFound();

  if (!canEditArticle(session!.user.role, article.authorId, session!.user.id)) {
    redirect("/admin/articles");
  }

  return (
    <div>
      <PageHeader title="Мэдээ засах" />
      <ArticleForm
        categories={categories}
        canPublish={hasPermission(session!.user.role, "article.publish")}
        authorName={article.author.name}
        defaultCommentsEnabled={commentsEnabledSetting === "true"}
        initial={{
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          coverImage: article.coverImage,
          categoryIds: article.categories.map((c) => c.id),
          status: article.status,
          publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
          commentsEnabled: article.commentsEnabled,
        }}
      />
    </div>
  );
}
