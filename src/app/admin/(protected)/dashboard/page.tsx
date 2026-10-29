import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { formatDate, formatDateTime } from "@/lib/format";
import { getArticlePath } from "@/lib/article-url";
import { getSetting } from "@/lib/settings";
import PageHeader from "@/components/admin/ui/PageHeader";
import StatCard from "@/components/admin/ui/StatCard";
import Card from "@/components/admin/ui/Card";
import Badge from "@/components/admin/ui/Badge";

export default async function DashboardPage() {
  const session = await auth();
  const role = session!.user.role;
  const userId = session!.user.id;

  const articleWhere = hasPermission(role, "article.editAny") ? {} : { authorId: userId };
  const canViewComments = hasPermission(role, "comments.manage");
  const canViewUsers = hasPermission(role, "users.manage");
  const canViewCategories = hasPermission(role, "category.manage");
  const canViewMenu = hasPermission(role, "menu.manage");

  const [
    totalArticles,
    published,
    draft,
    totalComments,
    totalUsers,
    totalCategories,
    totalMenuItems,
    recentArticles,
    topArticles,
    recentComments,
    articleUrlMode,
  ] = await Promise.all([
    prisma.article.count({ where: articleWhere }),
    prisma.article.count({ where: { ...articleWhere, status: "PUBLISHED" } }),
    prisma.article.count({ where: { ...articleWhere, status: "DRAFT" } }),
    prisma.comment.count(),
    canViewUsers ? prisma.user.count() : Promise.resolve(null),
    canViewCategories ? prisma.category.count() : Promise.resolve(null),
    canViewMenu ? prisma.menuItem.count() : Promise.resolve(null),
    prisma.article.findMany({
      where: articleWhere,
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, numericId: true, title: true, status: true, createdAt: true, author: { select: { name: true } } },
    }),
    prisma.article.findMany({
      where: articleWhere,
      orderBy: { viewCount: "desc" },
      take: 5,
      select: { id: true, numericId: true, title: true, viewCount: true },
    }),
    canViewComments
      ? prisma.comment.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            name: true,
            content: true,
            createdAt: true,
            article: { select: { slug: true, numericId: true, title: true } },
          },
        })
      : Promise.resolve([]),
    getSetting("article_url_mode"),
  ]);

  const cards = [
    { label: "Нийт мэдээ", value: totalArticles },
    { label: "Нийтэлсэн", value: published },
    { label: "Ноорог", value: draft },
    { label: "Нийт сэтгэгдэл", value: totalComments },
  ];
  if (totalCategories !== null) {
    cards.push({ label: "Ангилал", value: totalCategories });
  }
  if (totalMenuItems !== null) {
    cards.push({ label: "Цэс", value: totalMenuItems });
  }
  if (totalUsers !== null) {
    cards.push({ label: "Админ", value: totalUsers });
  }

  return (
    <div>
      <PageHeader title="Хянах самбар" description="Сайтын ерөнхий үзүүлэлтүүд" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {cards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-bold">Сүүлд нэмэгдсэн мэдээ</h2>
          {recentArticles.length === 0 ? (
            <p className="text-sm text-muted">Мэдээ алга байна.</p>
          ) : (
            <ul className="space-y-3">
              {recentArticles.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3">
                  <Link
                    href={`/admin/articles/${a.numericId}`}
                    className="min-w-0 flex-1 truncate text-sm font-semibold hover:text-accent hover:underline"
                  >
                    {a.title}
                  </Link>
                  <Badge variant={a.status === "PUBLISHED" ? "green" : "muted"}>
                    {a.status === "PUBLISHED" ? "Нийтэлсэн" : "Ноорог"}
                  </Badge>
                  <span className="shrink-0 text-xs text-muted">{formatDate(a.createdAt.toISOString())}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-bold">Хамгийн их уншсан мэдээ</h2>
          {topArticles.length === 0 ? (
            <p className="text-sm text-muted">Мэдээ алга байна.</p>
          ) : (
            <ul className="space-y-3">
              {topArticles.map((a, i) => (
                <li key={a.id} className="flex items-center gap-3">
                  <span className="w-5 shrink-0 text-sm font-bold text-muted">{i + 1}</span>
                  <Link
                    href={`/admin/articles/${a.numericId}`}
                    className="min-w-0 flex-1 truncate text-sm font-semibold hover:text-accent hover:underline"
                  >
                    {a.title}
                  </Link>
                  <span className="shrink-0 text-xs font-semibold text-muted">{a.viewCount} үзэлт</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {canViewComments && (
          <Card className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">Сүүлийн сэтгэгдлүүд</h2>
              <Link href="/admin/comments" className="text-sm font-semibold text-accent hover:underline">
                Бүгдийг харах →
              </Link>
            </div>
            {recentComments.length === 0 ? (
              <p className="text-sm text-muted">Сэтгэгдэл алга байна.</p>
            ) : (
              <ul className="space-y-3">
                {recentComments.map((c) => (
                  <li key={c.id} className="flex flex-col gap-1 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold">{c.name}</span>
                      <span className="shrink-0 text-xs text-muted">{formatDateTime(c.createdAt)}</span>
                    </div>
                    <p className="truncate text-sm text-muted">{c.content}</p>
                    <Link
                      href={getArticlePath(c.article, articleUrlMode)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-xs font-semibold text-accent hover:underline"
                    >
                      {c.article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
