"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import RichTextEditor from "./RichTextEditor";
import Card from "./ui/Card";
import { fieldClass, buttonPrimaryClass, buttonDangerClass } from "./ui/styles";
import { useConfirm } from "./useConfirm";

interface PageData {
  id?: string;
  title: string;
  slug: string;
  content: string;
  showInFooter: boolean;
}

export default function PageForm({ initial }: { initial?: PageData }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [showInFooter, setShowInFooter] = useState(initial?.showInFooter ?? false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  const isEdit = Boolean(initial?.id);

  async function handleDelete() {
    if (!initial?.id) return;
    if (!(await confirm("Энэ хуудсыг устгахдаа итгэлтэй байна уу?"))) return;

    setDeleting(true);
    const res = await fetch(`/api/admin/pages/${initial.id}`, { method: "DELETE" });
    setDeleting(false);

    if (!res.ok) {
      setError("Устгахад алдаа гарлаа");
      return;
    }

    router.push("/admin/pages");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!content.trim()) {
      setError("Дэлгэрэнгүй агуулга хоосон байна");
      return;
    }

    setSaving(true);
    setError(null);

    const payload: Record<string, unknown> = { title, content, showInFooter };
    if (slug.trim()) payload.slug = slug.trim();

    const res = await fetch(
      isEdit ? `/api/admin/pages/${initial!.id}` : "/api/admin/pages",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(typeof data?.error === "string" ? data.error : "Хадгалахад алдаа гарлаа");
      return;
    }

    router.push("/admin/pages");
    router.refresh();
  }

  return (
    <>
      {ConfirmDialog}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
            {error}
          </p>
        )}

        <Card className="space-y-5">
          <label className="block text-sm font-semibold">
            Гарчиг
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={`mt-1.5 font-normal ${fieldClass}`}
            />
          </label>

          <label className="block text-sm font-semibold">
            Слаг (URL)
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="жишээ: holboo-barih (хоосон бол гарчгаас автоматаар үүснэ)"
              className={`mt-1.5 font-normal ${fieldClass}`}
            />
            {initial?.slug && (
              <span className="mt-1 block text-xs text-muted">/page/{initial.slug}</span>
            )}
          </label>

          <label className="flex items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={showInFooter}
              onChange={(e) => setShowInFooter(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border accent-accent"
            />
            Footer хэсэгт холбоос харуулах
          </label>
        </Card>

        <Card>
          <p className="mb-2 text-sm font-semibold">Дэлгэрэнгүй агуулга</p>
          <RichTextEditor value={content} onChange={setContent} />
        </Card>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className={buttonPrimaryClass}>
            {saving ? "Хадгалж байна..." : "Хадгалах"}
          </button>
          {isEdit && (
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className={buttonDangerClass}
            >
              {deleting ? "Устгаж байна..." : "Устгах"}
            </button>
          )}
        </div>
      </form>
    </>
  );
}
