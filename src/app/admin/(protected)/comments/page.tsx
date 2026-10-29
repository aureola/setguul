import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { getSetting } from "@/lib/settings";
import PageHeader from "@/components/admin/ui/PageHeader";
import CommentsManager from "@/components/admin/CommentsManager";

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!hasPermission(session!.user.role, "comments.manage")) redirect("/admin/dashboard");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const pageSize = 50;

  const [comments, total, articleUrlMode] = await Promise.all([
    prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
      select: {
        id: true,
        name: true,
        content: true,
        ip: true,
        createdAt: true,
        article: { select: { id: true, numericId: true, title: true, slug: true } },
      },
    }),
    prisma.comment.count(),
    getSetting("article_url_mode"),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <PageHeader title="Сэтгэгдэл" description="Сайт дээр үлдээсэн сэтгэгдлүүдийг удирдах" />
      <CommentsManager
        initial={comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))}
        page={page}
        totalPages={totalPages}
        articleUrlMode={articleUrlMode}
      />
    </div>
  );
}
