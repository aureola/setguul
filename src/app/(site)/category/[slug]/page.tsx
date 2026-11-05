import { notFound } from "next/navigation";
import ArticleCard from "@/components/site/ArticleCard";
import Pagination from "@/components/site/Pagination";
import { countArticlesByCategory, getArticlesByCategory } from "@/lib/articles";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const currentPage = Math.max(1, Number(pageParam) || 1);

  const settings = await getSettings();
  const pageSize = Math.max(1, Number(settings.category_page_size) || 20);

  const [articles, totalCount] = await Promise.all([
    getArticlesByCategory(slug, pageSize, (currentPage - 1) * pageSize),
    countArticlesByCategory(slug),
  ]);
  const urlMode = settings.article_url_mode;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="container-page py-12">
      <h1 className="mb-8 text-3xl font-extrabold uppercase">{category.nameMn}</h1>
      {articles.length === 0 ? (
        <p className="text-muted">Энэ ангилалд мэдээ алга байна.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} urlMode={urlMode} />
            ))}
          </div>
          <Pagination
            basePath={`/category/${slug}`}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
}
