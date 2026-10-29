import { notFound } from "next/navigation";
import ArticleCard from "@/components/site/ArticleCard";
import { getArticlesByCategory } from "@/lib/articles";
import { getSetting } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const [articles, urlMode] = await Promise.all([
    getArticlesByCategory(slug),
    getSetting("article_url_mode"),
  ]);

  return (
    <div className="container-page py-12">
      <h1 className="mb-8 text-3xl font-extrabold uppercase">{category.nameMn}</h1>
      {articles.length === 0 ? (
        <p className="text-muted">Энэ ангилалд мэдээ алга байна.</p>
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
