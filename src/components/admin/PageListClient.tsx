"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TableCard, theadRowClass, thClass, tdClass, trClass } from "./ui/Table";
import { EditIcon, TrashIcon } from "./ui/icons";
import { iconButtonEditClass, iconButtonDangerClass } from "./ui/styles";
import { useConfirm } from "./useConfirm";

interface PageRow {
  id: string;
  title: string;
  slug: string;
  showInFooter: boolean;
}

export default function PageListClient({ pages }: { pages: PageRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  async function handleDelete(id: string) {
    if (!(await confirm("Энэ хуудсыг устгахдаа итгэлтэй байна уу?"))) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!res.ok) {
      alert("Устгахад алдаа гарлаа");
      return;
    }
    router.refresh();
  }

  if (pages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted">
        Хуудас алга байна.
      </div>
    );
  }

  return (
    <div>
      <TableCard>
        <thead>
          <tr className={theadRowClass}>
            <th className={thClass}>Гарчиг</th>
            <th className={thClass}>Холбоос</th>
            <th className={`${thClass} w-28 text-center`}>Footer</th>
            <th className={`${thClass} w-20`}></th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.id} className={trClass}>
              <td className={`${tdClass} font-semibold`}>
                <Link href={`/admin/pages/${page.id}`} className="hover:text-accent hover:underline">
                  {page.title}
                </Link>
              </td>
              <td className={`${tdClass} text-muted`}>/page/{page.slug}</td>
              <td className={`${tdClass} text-center`}>
                {page.showInFooter ? (
                  <span className="text-xs font-semibold text-accent">Тийм</span>
                ) : (
                  <span className="text-xs text-muted">Үгүй</span>
                )}
              </td>
              <td className={`${tdClass} whitespace-nowrap`}>
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/pages/${page.id}`}
                    title="Засах"
                    aria-label="Засах"
                    className={iconButtonEditClass}
                  >
                    <EditIcon />
                  </Link>
                  <button
                    onClick={() => handleDelete(page.id)}
                    disabled={deletingId === page.id}
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
