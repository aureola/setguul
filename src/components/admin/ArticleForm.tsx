"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ImageUploader from "./ImageUploader";
import RichTextEditor from "./RichTextEditor";
import CategoryTagSelect from "./CategoryTagSelect";
import Card from "./ui/Card";
import { fieldClass, buttonPrimaryClass, buttonDangerClass } from "./ui/styles";
import { useConfirm } from "./useConfirm";

interface Category {
  id: string;
  nameMn: string;
}

interface ArticleData {
  id?: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  categoryIds: string[];
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  commentsEnabled: boolean | null;
}

function toLocalDateTimeInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ArticleForm({
  categories,
  initial,
  canPublish,
  authorName,
  defaultCommentsEnabled,
}: {
  categories: Category[];
  initial?: ArticleData;
  canPublish: boolean;
  authorName?: string;
  /** The site-wide "comments_enabled" setting, used as the initial checkbox
   * state for articles that haven't been given an explicit override yet. */
  defaultCommentsEnabled: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImage, setCoverImage] = useState<string | null>(
    initial?.coverImage ?? null,
  );
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initial?.categoryIds ?? (categories[0] ? [categories[0].id] : []),
  );
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    initial?.status ?? (canPublish ? "PUBLISHED" : "DRAFT"),
  );
  const [publishedAt, setPublishedAt] = useState(
    toLocalDateTimeInput(initial?.publishedAt ?? null),
  );
  const [commentsEnabled, setCommentsEnabled] = useState(
    initial?.commentsEnabled ?? defaultCommentsEnabled,
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  const isEdit = Boolean(initial?.id);

  async function handleDelete() {
    if (!initial?.id) return;
    if (!(await confirm("Энэ мэдээг устгахдаа итгэлтэй байна уу?"))) return;

    setDeleting(true);
    const res = await fetch(`/api/admin/articles/${initial.id}`, {
      method: "DELETE",
    });
    setDeleting(false);

    if (!res.ok) {
      setError("Устгахад алдаа гарлаа");
      return;
    }

    router.push("/admin/articles");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!content.trim()) {
      setError("Дэлгэрэнгүй агуулга хоосон байна");
      return;
    }

    if (categoryIds.length === 0) {
      setError("Дор хаяж нэг ангилал сонгоно уу");
      return;
    }

    setSaving(true);
    setError(null);

    const payload: Record<string, unknown> = {
      title,
      excerpt,
      content,
      coverImage,
      categoryIds,
      status,
      commentsEnabled,
    };
    if (publishedAt) {
      payload.publishedAt = new Date(publishedAt).toISOString();
    }
    const res = await fetch(
      isEdit ? `/api/admin/articles/${initial!.id}` : "/api/admin/articles",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(
        typeof data?.error === "string"
          ? data.error
          : "Хадгалахад алдаа гарлаа",
      );
      return;
    }

    router.push("/admin/articles");
    router.refresh();
  }

  return (
    <>
      {ConfirmDialog}
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
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

          <div className="flex flex-wrap gap-5">
            <label className="block text-sm font-semibold">
              Нийтлэх огноо
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className={`mt-1.5 font-normal ${fieldClass}`}
              />
            </label>
            {authorName && (
              <div className="text-sm font-semibold">
                Нийтэлсэн
                <p className="mt-1.5 flex h-[46px] items-center rounded-lg border border-border px-3 text-sm font-normal text-muted">
                  {authorName}
                </p>
              </div>
            )}
          </div>

          <div className="block text-sm font-semibold">
            Ангилал
            <div className="mt-1.5">
              <CategoryTagSelect
                categories={categories}
                value={categoryIds}
                onChange={setCategoryIds}
              />
            </div>
          </div>

          <ImageUploader
            label="Нүүр зураг"
            value={coverImage}
            onChange={setCoverImage}
          />

          <label className="block text-sm font-semibold">
            Товч танилцуулга
            <textarea
              value={excerpt ?? ""}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              maxLength={500}
              className={`mt-1.5 font-normal ${fieldClass}`}
            />
          </label>
        </Card>

        <Card>
          <p className="mb-2 text-sm font-semibold">Дэлгэрэнгүй агуулга</p>
          <RichTextEditor value={content} onChange={setContent} />
        </Card>

        <Card>
          <fieldset className="flex items-center gap-6 text-sm">
            <legend className="mb-2 text-sm font-semibold">Төлөв</legend>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="status"
                checked={status === "DRAFT"}
                onChange={() => setStatus("DRAFT")}
                className="h-4 w-4 accent-accent"
              />
              Ноорог
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="status"
                checked={status === "PUBLISHED"}
                disabled={!canPublish}
                onChange={() => setStatus("PUBLISHED")}
                className="h-4 w-4 accent-accent"
              />
              Нийтлэх {!canPublish && "(эрхгүй)"}
            </label>
          </fieldset>
        </Card>

        <Card>
          <label className="flex items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={commentsEnabled}
              onChange={(e) => setCommentsEnabled(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border accent-accent"
            />
            <span>
              <span className="font-semibold">
                Энэ мэдээнд сэтгэгдэл бичихийг зөвшөөрөх
              </span>
              <br />
            </span>
          </label>
        </Card>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className={buttonPrimaryClass}
          >
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
