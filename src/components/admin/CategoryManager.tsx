"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "./ui/Card";
import { TableCard, theadRowClass, thClass, tdClass, trClass } from "./ui/Table";
import { fieldClass, buttonPrimaryClass, linkActionClass, iconButtonEditClass, iconButtonDangerClass } from "./ui/styles";
import { EditIcon, TrashIcon } from "./ui/icons";
import { useConfirm } from "./useConfirm";

interface Category {
  id: string;
  nameMn: string;
  slug: string;
  order: number;
}

export default function CategoryManager({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameMn: name, order: initial.length }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Нэмэхэд алдаа гарлаа");
      return;
    }
    setName("");
    router.refresh();
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditName(category.nameMn);
    setEditSlug(category.slug);
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  async function handleSaveEdit(id: string) {
    setEditSaving(true);
    setEditError(null);
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameMn: editName, slug: editSlug }),
    });
    setEditSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setEditError(typeof data?.error === "string" ? data.error : "Хадгалахад алдаа гарлаа");
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!(await confirm("Устгах уу?"))) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.error ?? "Устгахад алдаа гарлаа");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {ConfirmDialog}
      <Card>
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Шинэ ангиллын нэр"
            className={fieldClass}
          />
          <button type="submit" disabled={saving} className={buttonPrimaryClass}>
            {saving ? "..." : "Нэмэх"}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </Card>

      {initial.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted">
          Ангилал алга байна.
        </div>
      ) : (
        <TableCard>
          <thead>
            <tr className={theadRowClass}>
              <th className={thClass}>Нэр</th>
              <th className={thClass}>Slug</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {initial.map((c) => {
              const isEditing = editingId === c.id;
              return (
                <tr key={c.id} className={trClass}>
                  {isEditing ? (
                    <>
                      <td className={tdClass}>
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                          className={fieldClass}
                        />
                        {editError && <p className="mt-1 text-xs text-red-400">{editError}</p>}
                      </td>
                      <td className={tdClass}>
                        <input
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className={`${fieldClass} text-muted`}
                        />
                      </td>
                      <td className={`${tdClass} text-right whitespace-nowrap`}>
                        <button
                          onClick={() => handleSaveEdit(c.id)}
                          disabled={editSaving}
                          className={`mr-4 ${linkActionClass} disabled:opacity-50`}
                        >
                          Хадгалах
                        </button>
                        <button onClick={cancelEdit} className="text-sm font-semibold text-muted hover:underline">
                          Цуцлах
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className={`${tdClass} font-semibold`}>{c.nameMn}</td>
                      <td className={`${tdClass} text-muted`}>{c.slug}</td>
                      <td className={`${tdClass} whitespace-nowrap`}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(c)}
                            title="Засах"
                            aria-label="Засах"
                            className={iconButtonEditClass}
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            title="Устгах"
                            aria-label="Устгах"
                            className={iconButtonDangerClass}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </TableCard>
      )}
    </div>
  );
}
