"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/format";
import { CalendarIcon, GlobeIcon, UserIcon } from "@/components/admin/ui/icons";

interface CommentItem {
  id: string;
  name: string;
  content: string;
  createdAt: string | Date;
  ip?: string | null;
}

export default function CommentsSection({
  slug,
  initialComments,
}: {
  slug: string;
  initialComments: CommentItem[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/articles/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(typeof data?.error === "string" ? data.error : "Сэтгэгдэл илгээхэд алдаа гарлаа");
      return;
    }

    const data = await res.json();
    setComments((prev) => [data.comment, ...prev]);
    setName("");
    setContent("");
  }

  return (
    <section className="mt-14 border-t border-border pt-8">
      <h2 className="text-xl font-black uppercase">Сэтгэгдэл ({comments.length})</h2>

      <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-3">
        {error && (
          <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Таны нэр"
          required
          maxLength={80}
          className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Сэтгэгдэл бичих..."
          required
          rows={3}
          maxLength={2000}
          className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-bold text-accent-contrast hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Илгээж байна..." : "Сэтгэгдэл илгээх"}
        </button>
      </form>

      <ul className="mt-8 space-y-5">
        {comments.map((comment) => (
          <li key={comment.id} className="border-b border-border pb-5">
            <div className="flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 font-bold">
                <UserIcon className="h-4 w-4" />
                {comment.name}
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted">
                <CalendarIcon className="h-4 w-4" />
                {formatDateTime(comment.createdAt)}
              </span>
              {comment.ip && (
                <span className="inline-flex items-center gap-1.5 text-muted">
                  <GlobeIcon className="h-4 w-4" />
                  {comment.ip}
                </span>
              )}
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-muted">{comment.content}</p>
          </li>
        ))}
        {comments.length === 0 && (
          <li className="text-sm text-muted">Одоогоор сэтгэгдэл алга. Эхнийх нь та байгаарай!</li>
        )}
      </ul>
    </section>
  );
}
