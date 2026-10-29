import Link from "next/link";
import Hero from "@/components/site/Hero";
import ArticleCard from "@/components/site/ArticleCard";
import UsefulReadsCarousel from "@/components/site/UsefulReadsCarousel";
import { getFeaturedArticle, getLatestArticles } from "@/lib/articles";
import { getSetting } from "@/lib/settings";

export default async function HomePage() {
  const [tagline, urlMode, featured, latest, usefulReads] = await Promise.all([
    getSetting("site_tagline"),
    getSetting("article_url_mode"),
    getFeaturedArticle(),
    getLatestArticles(8),
    getLatestArticles(20),
  ]);

  const latestIssue = latest.slice(0, 4);

  return (
    <div className="pb-20">
      <Hero tagline={tagline} article={featured} urlMode={urlMode} />

      <section className="container-page mt-16">
        <UsefulReadsCarousel articles={usefulReads} urlMode={urlMode} />
      </section>

      <section className="container-page mt-16">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="shrink-0">
            <p className="text-sm font-bold uppercase tracking-widest text-muted">
              Latest <br /> Issue
            </p>
            <p className="mt-4 text-7xl font-black text-accent">07</p>
            <p className="text-sm font-bold uppercase text-muted">Spring Edition</p>
            <Link
              href="/category/technology"
              className="mt-6 inline-block text-sm font-bold uppercase text-accent hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-4 lg:grid-cols-4">
            {latestIssue.map((article) => (
              <ArticleCard key={article.id} article={article} urlMode={urlMode} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
