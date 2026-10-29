"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { TableCard, theadRowClass, thClass, tdClass, trClass } from "./ui/Table";
import { EyeIcon, CommentIcon, StatusIcon, EditIcon, TrashIcon } from "./ui/icons";
import { iconButtonEditClass, iconButtonDangerClass } from "./ui/styles";
import { useConfirm } from "./useConfirm";

interface ArticleRow {
  id: string;
  numericId: number;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  viewCount: number;
  commentCount: number;
  categories: { nameMn: string }[];
  author: { name: string };
}

export default function ArticleListClient({ articles }: { articles: ArticleRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  const allSelected = articles.length > 0 && selected.size === articles.length;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(articles.map((a) => a.id)));
  }

  async function handleDelete(id: string) {
    if (!(await confirm("Энэ мэдээг устгахдаа итгэлтэй байна уу?"))) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!res.ok) {
      alert("Устгахад алдаа гарлаа");
      return;
    }
    router.refresh();
  }

  async function handleBulkDelete() {
    if (!(await confirm(`Сонгосон ${selected.size} мэдээг устгахдаа итгэлтэй байна уу?`))) return;
    setBulkDeleting(true);
    await Promise.all(
      [...selected].map((id) => fetch(`/api/admin/articles/${id}`, { method: "DELETE" })),
    );
    setBulkDeleting(false);
    setSelected(new Set());
    router.refresh();
  }

  if (articles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted">
        Мэдээ алга байна.
      </div>
    );
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2.5 text-sm">
          <span>{selected.size} мэдээ сонгогдсон</span>
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            className="font-semibold text-red-400 hover:underline disabled:opacity-50"
          >
            {bulkDeleting ? "Устгаж байна..." : "Сонгосныг устгах"}
          </button>
        </div>
      )}

      <TableCard fixed>
        <thead>
          <tr className={theadRowClass}>
            <th className={`${thClass} w-10`}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-border accent-accent"
              />
            </th>
            <th className={thClass}>Гарчиг</th>
            <th className={`${thClass} w-14 text-center`}>
              <EyeIcon className="mx-auto h-4 w-4" />
            </th>
            <th className={`${thClass} w-14 text-center`}>
              <CommentIcon className="mx-auto h-4 w-4" />
            </th>
            <th className={`${thClass} w-28`}>Ангилал</th>
            <th className={`${thClass} w-24`}>Админ</th>
            <th className={`${thClass} w-14 text-center`}>Төлөв</th>
            <th className={`${thClass} w-20`}></th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id} className={`${trClass} align-top`}>
              <td className={tdClass}>
                <input
                  type="checkbox"
                  checked={selected.has(article.id)}
                  onChange={() => toggleOne(article.id)}
                  className="h-4 w-4 rounded border-border accent-accent"
                />
              </td>
              <td className={tdClass}>
                <div className="flex items-baseline gap-2.5">
                  <span className="shrink-0 text-xs text-muted">{formatDate(article.createdAt)}</span>
                  <Link
                    href={`/admin/articles/${article.numericId}`}
                    className="min-w-0 flex-1 font-semibold break-words transition hover:text-accent hover:underline"
                  >
                    {article.title}
                  </Link>
                </div>
              </td>
              <td className={`${tdClass} text-center text-muted`}>{article.viewCount}</td>
              <td className={`${tdClass} text-center text-muted`}>{article.commentCount}</td>
              <td className={tdClass}>
                {article.categories.length > 0 ? (
                  <div className="space-y-1">
                    {article.categories.map((c, i) => (
                      <div key={c.nameMn} className="break-words">
                        {c.nameMn}
                        {i < article.categories.length - 1 ? "," : ""}
                      </div>
                    ))}
                  </div>
                ) : (
                  "—"
                )}
              </td>
              <td className={`${tdClass} break-words`}>{article.author.name}</td>
              <td className={`${tdClass} text-center`}>
                <StatusIcon published={article.status === "PUBLISHED"} className="mx-auto h-6 w-6" />
              </td>
              <td className={`${tdClass} whitespace-nowrap`}>
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/articles/${article.numericId}`}
                    title="Засах"
                    aria-label="Засах"
                    className={iconButtonEditClass}
                  >
                    <EditIcon />
                  </Link>
                  <button
                    onClick={() => handleDelete(article.id)}
                    disabled={deletingId === article.id}
                    title="Устгах"
                    aria-label="Устгах"
                    className={iconButtonDangerClass}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </TableCard>

      {ConfirmDialog}
    </div>
  );
}
