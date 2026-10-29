import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/format";
import { getArticlePath } from "@/lib/article-url";

interface ArticleCardProps {
  index?: number;
  article: {
    slug: string;
    numericId: number;
    title: string;
    coverImage: string | null;
    publishedAt: Date | null;
    categories: { slug: string; nameMn: string }[];
  };
  accentIndex?: boolean;
  urlMode?: string;
}

const BADGE_COLORS = ["bg-accent text-accent-contrast", "bg-magenta text-white", "bg-foreground text-background", "bg-accent text-accent-contrast"];

export default function ArticleCard({ index, article, urlMode = "slug" }: ArticleCardProps) {
  return (
    <Link
      href={getArticlePath(article, urlMode)}
      className="group block overflow-hidden rounded-lg border border-border bg-surface transition hover:border-accent"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover grayscale transition duration-300 group-hover:grayscale-0"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">Зураггүй</div>
        )}
        {typeof index === "number" && (
          <span
            className={`absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-extrabold ${BADGE_COLORS[index % BADGE_COLORS.length]}`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </div>
      <div className="p-4">
        {article.categories[0] && (
          <span className="text-xs font-bold uppercase tracking-wide text-magenta">
            {article.categories[0].nameMn}
          </span>
        )}
        <h3 className="mt-2 text-base font-extrabold uppercase leading-snug group-hover:text-accent">
          {article.title}
        </h3>
        {article.publishedAt && (
          <time className="mt-3 block text-xs text-muted">{formatDate(article.publishedAt)}</time>
        )}
      </div>
    </Link>
  );
}
