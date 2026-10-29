import Link from "next/link";
import Image from "next/image";
import { getArticlePath } from "@/lib/article-url";

interface HeroProps {
  tagline: string;
  article: {
    slug: string;
    numericId: number;
    title: string;
    excerpt: string | null;
    coverImage: string | null;
  } | null;
  urlMode?: string;
}

export default function Hero({ tagline, article, urlMode = "slug" }: HeroProps) {
  return (
    <section className="container-page relative mt-10 overflow-hidden rounded-2xl border border-border">
      <div className="relative min-h-[520px] w-full bg-surface">
        {article?.coverImage && (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            priority
            className="object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="relative z-10 flex h-full min-h-[520px] flex-col justify-between p-8 md:p-12">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-bold tracking-widest text-muted">ISSUE 07</p>
              <p className="text-xs font-bold tracking-widest text-muted">MAY 2024</p>
              <div className="mt-4 h-px w-10 bg-accent" />
              <p className="mt-4 max-w-[180px] text-sm text-muted">{tagline}</p>
            </div>

            <h1 className="max-w-xl text-5xl font-black uppercase leading-[0.95] md:text-6xl">
              Сонирх. <br />
              <span className="text-accent">Ойлго.</span> <br />
              Хөгж.
            </h1>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-sm">
              <p className="mb-5 text-sm text-muted">
                Бид таны мэдлэг, ойлголт, бүтээлч сэтгэлгээт өргөжүүлэх контентыг хүргэдэг.
              </p>
              {article && (
                <Link
                  href={getArticlePath(article, urlMode)}
                  className="inline-block rounded-md bg-accent px-6 py-3 text-sm font-bold text-accent-contrast hover:opacity-90"
                >
                  СЭТГҮҮЛ УНШИХ →
                </Link>
              )}
            </div>

            <div className="text-right">
              <p className="text-5xl font-black text-accent">4</p>
              <p className="text-2xl font-black uppercase leading-none">
                shows <br />
                to watch <br />
                this <span className="text-magenta">season</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
