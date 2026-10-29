"use client";

import { useRef } from "react";
import ArticleCard from "./ArticleCard";

interface CarouselArticle {
  id: string;
  slug: string;
  numericId: number;
  title: string;
  coverImage: string | null;
  publishedAt: Date | null;
  categories: { slug: string; nameMn: string }[];
}

export default function UsefulReadsCarousel({
  articles,
  urlMode,
}: {
  articles: CarouselArticle[];
  urlMode: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByCards(direction: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>("[data-carousel-card]")?.offsetWidth ?? 280;
    el.scrollBy({ left: direction * (cardWidth + 16) * 2, behavior: "smooth" });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-extrabold uppercase tracking-wide">Ашигтай уншигдах</h2>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollByCards(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:border-accent"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollByCards(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:border-accent"
          >
            ›
          </button>
        </div>
      </div>

      {articles.length === 0 ? (
        <p className="text-muted">Одоогоор нийтэлсэн мэдээ алга байна.</p>
      ) : (
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {articles.map((article, i) => (
            <div
              key={article.id}
              data-carousel-card
              className="w-[70%] shrink-0 snap-start sm:w-[45%] lg:w-[23%]"
            >
              <ArticleCard article={article} index={i} urlMode={urlMode} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
