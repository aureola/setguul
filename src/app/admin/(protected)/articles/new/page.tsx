import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { getSetting } from "@/lib/settings";
import ArticleForm from "@/components/admin/ArticleForm";
import PageHeader from "@/components/admin/ui/PageHeader";

export default async function NewArticlePage() {
  const [session, categories, commentsEnabledSetting] = await Promise.all([
    auth(),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    getSetting("comments_enabled"),
  ]);

  return (
    <div>
      <PageHeader title="Мэдээ нэмэх" />
      <ArticleForm
        categories={categories}
        canPublish={hasPermission(session!.user.role, "article.publish")}
        authorName={session!.user.name}
        defaultCommentsEnabled={commentsEnabledSetting === "true"}
      />
    </div>
  );
}
