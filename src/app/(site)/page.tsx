import Link from "next/link";
import Hero from "@/components/site/Hero";
import ArticleCard from "@/components/site/ArticleCard";
import UsefulReadsCarousel from "@/components/site/UsefulReadsCarousel";
import {
  getFeaturedArticle,
  getLatestArticles,
  getMenuCategoriesWithArticles,
} from "@/lib/articles";
import { getSetting } from "@/lib/settings";
import { getMenuItems } from "@/lib/menu";

export default async function HomePage() {
  const [urlMode, featured, usefulReads, menuItems] = await Promise.all([
    getSetting("article_url_mode"),
    getFeaturedArticle(),
    getLatestArticles(20),
    getMenuItems(),
  ]);
  const categories = await getMenuCategoriesWithArticles(menuItems);

  return (
    <div className="pb-20">
      <Hero article={featured} urlMode={urlMode} />

      <section className="container-page mt-16">
        <UsefulReadsCarousel articles={usefulReads} urlMode={urlMode} />
      </section>

      {categories.map((category) => (
        <section key={category.slug} className="container-page mt-16">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="lg:w-48 lg:shrink-0">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted">
                {category.nameMn}
              </h2>
              <Link
                href={`/category/${category.slug}`}
                className="mt-6 inline-block text-sm font-bold uppercase text-accent hover:underline"
              >
                Бүгд →
              </Link>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-4 lg:grid-cols-4">
              {category.articles.map((article) => (
                <ArticleCard key={article.id} article={article} urlMode={urlMode} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
