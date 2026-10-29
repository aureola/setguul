"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TableCard, theadRowClass, thClass, tdClass, trClass } from "./ui/Table";
import { iconButtonDangerClass, buttonDangerClass } from "./ui/styles";
import { TrashIcon } from "./ui/icons";
import { useConfirm } from "./useConfirm";
import { formatDateTime } from "@/lib/format";
import { getArticlePath } from "@/lib/article-url";

interface CommentRow {
  id: string;
  name: string;
  content: string;
  ip: string | null;
  createdAt: string;
  article: { id: string; numericId: number; title: string; slug: string };
}

export default function CommentsManager({
  initial,
  page,
  totalPages,
  articleUrlMode,
}: {
  initial: CommentRow[];
  page: number;
  totalPages: number;
  articleUrlMode: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  const allSelected = initial.length > 0 && selected.size === initial.length;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(initial.map((c) => c.id)));
  }

  async function handleDeleteOne(id: string) {
    if (!(await confirm("Энэ сэтгэгдлийг устгахдаа итгэлтэй байна уу?"))) return;
    setDeletingId(id);
    await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    setDeletingId(null);
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    router.refresh();
  }

  async function handleDeleteSelected() {
    if (selected.size === 0) return;
    if (!(await confirm(`Сонгосон ${selected.size} сэтгэгдлийг устгахдаа итгэлтэй байна уу?`, { danger: true })))
      return;
    setBulkDeleting(true);
    await fetch("/api/admin/comments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    setBulkDeleting(false);
    setSelected(new Set());
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {ConfirmDialog}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {selected.size > 0 ? `${selected.size} сэтгэгдэл сонгогдсон` : `Нийт ${initial.length} сэтгэгдэл`}
        </p>
        {selected.size > 0 && (
          <button
            onClick={handleDeleteSelected}
            disabled={bulkDeleting}
            className={buttonDangerClass}
          >
            {bulkDeleting ? "Устгаж байна..." : `Сонгосонг устгах (${selected.size})`}
          </button>
        )}
      </div>

      <TableCard>
        <thead>
          <tr className={theadRowClass}>
            <th className={thClass}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-border accent-accent"
                aria-label="Бүгдийг сонгох"
              />
            </th>
            <th className={thClass}>Огноо</th>
            <th className={thClass}>Нэр</th>
            <th className={thClass}>Сэтгэгдэл</th>
            <th className={thClass}>Мэдээ</th>
            <th className={thClass}>IP</th>
            <th className={thClass}></th>
          </tr>
        </thead>
        <tbody>
          {initial.map((c) => (
            <tr key={c.id} className={`${trClass} align-top`}>
              <td className={tdClass}>
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={() => toggleOne(c.id)}
                  className="h-4 w-4 rounded border-border accent-accent"
                  aria-label={`${c.name} сонгох`}
                />
              </td>
              <td className={`${tdClass} whitespace-nowrap text-muted`}>{formatDateTime(new Date(c.createdAt))}</td>
              <td className={`${tdClass} font-semibold`}>{c.name}</td>
              <td className={`${tdClass} max-w-md`}>{c.content}</td>
              <td className={tdClass}>
                <Link
                  href={getArticlePath(c.article, articleUrlMode)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  {c.article.title}
                </Link>
              </td>
              <td className={`${tdClass} whitespace-nowrap text-muted`}>{c.ip ?? "—"}</td>
              <td className={`${tdClass} text-right`}>
                <button
                  onClick={() => handleDeleteOne(c.id)}
                  disabled={deletingId === c.id}
                  title="Устгах"
                  aria-label="Устгах"
                  className={iconButtonDangerClass}
                >
                  <TrashIcon />
                </button>
              </td>
            </tr>
          ))}
          {initial.length === 0 && (
            <tr>
              <td colSpan={7} className={`${tdClass} text-center text-muted`}>
                Сэтгэгдэл алга байна
              </td>
            </tr>
          )}
        </tbody>
      </TableCard>

      {totalPages > 1 && (
        <div className="flex items-center gap-4 text-sm">
          {page > 1 && (
            <a href={`/admin/comments?page=${page - 1}`} className="font-semibold text-accent hover:underline">
              ← Өмнөх
            </a>
          )}
          <span className="text-muted">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <a href={`/admin/comments?page=${page + 1}`} className="font-semibold text-accent hover:underline">
              Дараах →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
