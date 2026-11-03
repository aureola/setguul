"use client";

import { useEffect, useState } from "react";
import {
  ARTICLE_REACTIONS,
  articleReactionSummarySchema,
  type ArticleReactionEmoji,
} from "@/lib/article-reactions";

type ReactionSummary = {
  counts: Record<ArticleReactionEmoji, number>;
  selected: ArticleReactionEmoji | null;
};

export default function ArticleReactions({ slug }: { slug: string }) {
  const [summary, setSummary] = useState<ReactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadReactions() {
      try {
        const response = await fetch(`/api/articles/${encodeURIComponent(slug)}/reactions`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            typeof data.error === "string" ? data.error : "Үнэлгээ ачаалж чадсангүй",
          );
        }
        const parsed = articleReactionSummarySchema.safeParse(data);
        if (!parsed.success) throw new Error("Үнэлгээний мэдээлэл буруу байна");
        if (active) setSummary(parsed.data);
      } catch {
        if (active) setError("Үнэлгээ ачаалж чадсангүй. Дахин оролдоно уу.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadReactions();
    return () => {
      active = false;
    };
  }, [slug]);

  async function submitReaction(emoji: ArticleReactionEmoji) {
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/articles/${encodeURIComponent(slug)}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Үнэлгээ илгээж чадсангүй",
        );
      }
      const parsed = articleReactionSummarySchema.safeParse(data);
      if (!parsed.success) throw new Error("Үнэлгээний мэдээлэл буруу байна");
      setSummary(parsed.data);
    } catch {
      setError("Үнэлгээ илгээж чадсангүй. Дахин оролдоно уу.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-12 border-t border-border pt-8" aria-labelledby="article-reactions-title">
      <h2 id="article-reactions-title" className="text-lg font-black uppercase">
        Энэ мэдээ танд ямар санагдсан бэ?
      </h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {ARTICLE_REACTIONS.map(({ emoji, label }) => (
          <button
            key={emoji}
            type="button"
            title={label}
            aria-label={`${label} гэж үнэлэх`}
            aria-pressed={summary?.selected === emoji}
            disabled={loading || submitting || !summary}
            onClick={() => void submitReaction(emoji)}
            className={`flex min-w-16 flex-col items-center gap-1 rounded-lg border px-3 py-2 transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60 ${
              summary?.selected === emoji
                ? "border-accent bg-accent/10"
                : "border-border"
            }`}
          >
            <span className="text-2xl" aria-hidden="true">{emoji}</span>
            <span className="text-xs text-muted">
              {loading ? "…" : summary?.counts[emoji] ?? 0}
            </span>
          </button>
        ))}
      </div>
      {error && <p role="status" className="mt-3 text-sm text-red-400">{error}</p>}
    </section>
  );
}
