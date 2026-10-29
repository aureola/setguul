import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getArticleByIdentifier, getSidebarArticles, incrementViewCount } from "@/lib/articles";
import { getArticlePath } from "@/lib/article-url";
import { getActiveBanners } from "@/lib/banners";
import { getCommentsByArticle } from "@/lib/comments";
import { formatDate } from "@/lib/format";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { getSetting } from "@/lib/settings";
import { auth } from "@/lib/auth";
import CommentsSection from "@/components/site/CommentsSection";
import ArticleSidebar from "@/components/site/ArticleSidebar";
import { UserIcon, CalendarIcon, EyeIcon } from "@/components/admin/ui/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ identifier: string }>;
}): Promise<Metadata> {
  const { identifier } = await params;
  const [article, urlMode] = await Promise.all([
    getArticleByIdentifier(identifier),
    getSetting("article_url_mode"),
  ]);
  if (!article) return {};

  const path = getArticlePath(article, urlMode);
  const description = article.excerpt ?? undefined;
  const images = article.coverImage ? [{ url: article.coverImage }] : undefined;

  return {
    title: article.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: article.title,
      description,
      url: path,
      siteName: "Setguul.mn",
      locale: "mn_MN",
      images,
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author.name],
      section: article.categories[0]?.nameMn,
      tags: article.categories.map((c) => c.nameMn),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: article.title,
      description,
      images,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ identifier: string }>;
}) {
  const { identifier } = await params;
  const article = await getArticleByIdentifier(identifier);
  if (!article) notFound();

  await incrementViewCount(article.id);

  const [session, showViewCount, commentsEnabledSetting, urlMode, comments, sidebarArticles, sidebarBanners] = await Promise.all([
    auth(),
    getSetting("show_view_count"),
    getSetting("comments_enabled"),
    getSetting("article_url_mode"),
    getCommentsByArticle(article.id),
    getSidebarArticles(article.id),
    getActiveBanners("article_sidebar"),
  ]);
  const canSeeViewCount = showViewCount === "true" && session?.user?.role === "ADMINISTRATOR";
  const commentsEnabled = article.commentsEnabled ?? commentsEnabledSetting === "true";

  return (
    <div className="container-page flex flex-col gap-10 py-12 lg:flex-row lg:items-start">
      <article className="min-w-0 max-w-3xl flex-1">
        <div className="flex flex-wrap gap-2">
          {article.categories.map((category, index) => (
            <span
              key={category.slug}
              className="text-xs font-bold uppercase tracking-wide text-magenta"
            >
              <Link href={`/category/${category.slug}`} className="hover:underline">
                {category.nameMn}
              </Link>
              {index < article.categories.length - 1 ? "," : ""}
            </span>
          ))}
        </div>
        <h1 className="mt-3 text-4xl font-black uppercase leading-tight">{article.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <UserIcon className="h-4 w-4" />
            {article.author.name}
          </span>
          {article.publishedAt && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" />
              <time>{formatDate(article.publishedAt)}</time>
            </span>
          )}
          {canSeeViewCount && (
            <span className="inline-flex items-center gap-1.5">
              <EyeIcon className="h-4 w-4" />
              {article.viewCount + 1} удаа үзсэн
            </span>
          )}
        </div>

        {article.coverImage && (
          <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-xl border border-border">
            <Image src={article.coverImage} alt={article.title} fill className="object-cover" />
          </div>
        )}

        <div
          className="prose prose-invert mt-10 max-w-none prose-headings:uppercase prose-a:text-accent"
          dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.content) }}
        />

        {commentsEnabled && <CommentsSection slug={article.slug} initialComments={comments} />}
      </article>

      <ArticleSidebar articles={sidebarArticles} banners={sidebarBanners} urlMode={urlMode} />
    </div>
  );
}
