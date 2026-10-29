import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/format";
import { getArticlePath } from "@/lib/article-url";

interface SidebarArticle {
  id: string;
  slug: string;
  numericId: number;
  title: string;
  coverImage: string | null;
  publishedAt: Date | null;
  categories: { nameMn: string }[];
}

interface SidebarBanner {
  id: string;
  title: string;
  type: "IMAGE" | "VIDEO" | "EMBED";
  imageUrl: string | null;
  videoUrl: string | null;
  embedHtml: string | null;
  linkUrl: string | null;
}

function BannerContent({ banner }: { banner: SidebarBanner }) {
  if (banner.type === "VIDEO" && banner.videoUrl) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg border border-border bg-black/40">
        <video src={banner.videoUrl} className="h-full w-full object-cover" autoPlay muted loop playsInline />
      </div>
    );
  }
  if (banner.type === "EMBED" && banner.embedHtml) {
    return (
      <div
        className="overflow-hidden rounded-lg border border-border"
        dangerouslySetInnerHTML={{ __html: banner.embedHtml }}
      />
    );
  }
  if (banner.imageUrl) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg border border-border bg-black/40">
        <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover" />
      </div>
    );
  }
  return null;
}

function groupByDate(articles: SidebarArticle[]): { date: string; items: SidebarArticle[] }[] {
  const groups: { date: string; items: SidebarArticle[] }[] = [];
  for (const article of articles) {
    const date = article.publishedAt ? formatDate(article.publishedAt) : "Огноогүй";
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.date === date) {
      lastGroup.items.push(article);
    } else {
      groups.push({ date, items: [article] });
    }
  }
  return groups;
}

export default function ArticleSidebar({
  articles,
  banners,
  urlMode = "slug",
}: {
  articles: SidebarArticle[];
  banners: SidebarBanner[];
  urlMode?: string;
}) {
  const groups = groupByDate(articles);

  return (
    <aside className="w-full space-y-8 lg:sticky lg:top-24 lg:w-80 lg:shrink-0">
      <div className="rounded-lg border border-border bg-surface">
        <h2 className="border-b border-border px-4 py-3 text-sm font-extrabold uppercase tracking-wide">
          Шинэ мэдээ
        </h2>
        <div className="max-h-[520px] space-y-5 overflow-y-auto p-4">
          {articles.length === 0 ? (
            <p className="text-sm text-muted">Мэдээ алга байна.</p>
          ) : (
            groups.map((group) => (
              <div key={group.date}>
                <div className="space-y-4">
                  {group.items.map((article) => (
                    <Link key={article.id} href={getArticlePath(article, urlMode)} className="group flex gap-3">
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-black/40">
                        {article.coverImage ? (
                          <Image
                            src={article.coverImage}
                            alt={article.title}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        {/* {article.categories[0] && (
                          <span className="text-[11px] font-bold uppercase tracking-wide text-magenta">
                            {article.categories[0].nameMn}
                          </span>
                        )} */}
                        <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-accent">
                          {article.title}
                        </h3>
                        {article.publishedAt && (
                          <time className="mt-1 block text-[11px] text-muted">{formatDate(article.publishedAt)}</time>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {banners.map((banner) => {
        const content = <BannerContent banner={banner} />;
        // Raw embed HTML (e.g. an iframe ad tag) may already be interactive
        // or carry its own click target, so it isn't wrapped in a link.
        const canLink = banner.type !== "EMBED" && banner.linkUrl;
        return (
          <div key={banner.id}>
            {canLink ? (
              <a href={banner.linkUrl!} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            ) : (
              content
            )}
          </div>
        );
      })}
    </aside>
  );
}
