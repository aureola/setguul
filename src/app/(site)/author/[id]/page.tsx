import { notFound } from "next/navigation";
import ArticleCard from "@/components/site/ArticleCard";
import { getArticlesByAuthor } from "@/lib/articles";
import { getSetting } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const author = await prisma.user.findUnique({ where: { id }, select: { name: true } });
  if (!author) notFound();

  const [articles, urlMode] = await Promise.all([
    getArticlesByAuthor(id),
    getSetting("article_url_mode"),
  ]);

  return (
    <div className="container-page py-12">
      <h1 className="mb-8 text-3xl font-extrabold uppercase">{author.name}</h1>
      {articles.length === 0 ? (
        <p className="text-muted">Энэ зохиогч одоогоор мэдээ нийтлээгүй байна.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} urlMode={urlMode} />
          ))}
        </div>
      )}
    </div>
  );
}
