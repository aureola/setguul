"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "./ui/Card";
import { TableCard, theadRowClass, thClass, tdClass, trClass } from "./ui/Table";
import { fieldClass, selectClass, buttonPrimaryClass, linkActionClass, iconButtonEditClass, iconButtonDangerClass } from "./ui/styles";
import { EditIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from "./ui/icons";
import { useConfirm } from "./useConfirm";

interface MenuItem {
  id: string;
  label: string;
  url: string;
  order: number;
}

interface Category {
  slug: string;
  nameMn: string;
}

const CUSTOM_URL = "__custom__";

function urlToChoice(url: string, categories: Category[]) {
  return categories.some((c) => `/category/${c.slug}` === url) ? url : CUSTOM_URL;
}

function UrlPicker({
  categories,
  urlChoice,
  onUrlChoiceChange,
  customUrl,
  onCustomUrlChange,
}: {
  categories: Category[];
  urlChoice: string;
  onUrlChoiceChange: (value: string) => void;
  customUrl: string;
  onCustomUrlChange: (value: string) => void;
}) {
  return (
    <>
      <select value={urlChoice} onChange={(e) => onUrlChoiceChange(e.target.value)} className={selectClass}>
        {categories.map((c) => (
          <option key={c.slug} value={`/category/${c.slug}`}>
            Ангилал: {c.nameMn}
          </option>
        ))}
        <option value={CUSTOM_URL}>Бусад холбоос...</option>
      </select>
      {urlChoice === CUSTOM_URL && (
        <input
          value={customUrl}
          onChange={(e) => onCustomUrlChange(e.target.value)}
          required
          placeholder="/about"
          className={`mt-1.5 ${fieldClass}`}
        />
      )}
    </>
  );
}

export default function MenuManager({
  initial,
  categories,
}: {
  initial: MenuItem[];
  categories: Category[];
}) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [urlChoice, setUrlChoice] = useState(categories[0] ? `/category/${categories[0].slug}` : CUSTOM_URL);
  const [customUrl, setCustomUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editUrlChoice, setEditUrlChoice] = useState(CUSTOM_URL);
  const [editCustomUrl, setEditCustomUrl] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  const url = urlChoice === CUSTOM_URL ? customUrl : urlChoice;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, url, order: initial.length }),
    });
    setSaving(false);
    setLabel("");
    setCustomUrl("");
    router.refresh();
  }

  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setEditLabel(item.label);
    const choice = urlToChoice(item.url, categories);
    setEditUrlChoice(choice);
    setEditCustomUrl(choice === CUSTOM_URL ? item.url : "");
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  async function handleSaveEdit(id: string) {
    const nextUrl = editUrlChoice === CUSTOM_URL ? editCustomUrl : editUrlChoice;
    setEditSaving(true);
    setEditError(null);
    const res = await fetch(`/api/admin/menu/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: editLabel, url: nextUrl }),
    });
    setEditSaving(false);
    if (!res.ok) {
      setEditError("Хадгалахад алдаа гарлаа");
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!(await confirm("Устгах уу?"))) return;
    await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function moveItem(index: number, direction: -1 | 1) {
    const other = initial[index + direction];
    const current = initial[index];
    if (!other) return;
    setMovingId(current.id);
    await Promise.all([
      fetch(`/api/admin/menu/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: other.order }),
      }),
      fetch(`/api/admin/menu/${other.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: current.order }),
      }),
    ]);
    setMovingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {ConfirmDialog}
      <Card>
        <form onSubmit={handleCreate} className="flex items-start gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            placeholder="Нэр"
            className={fieldClass}
          />
          <div className="w-full">
            <UrlPicker
              categories={categories}
              urlChoice={urlChoice}
              onUrlChoiceChange={setUrlChoice}
              customUrl={customUrl}
              onCustomUrlChange={setCustomUrl}
            />
          </div>
          <button type="submit" disabled={saving} className={buttonPrimaryClass}>
            {saving ? "..." : "Нэмэх"}
          </button>
        </form>
      </Card>

      {initial.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted">
          Цэс алга байна.
        </div>
      ) : (
        <TableCard>
          <thead>
            <tr className={theadRowClass}>
              <th className={thClass}>Нэр</th>
              <th className={thClass}>Холбоос</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {initial.map((item, index) => {
              const isEditing = editingId === item.id;
              return (
                <tr key={item.id} className={trClass}>
                  {isEditing ? (
                    <>
                      <td className={`${tdClass} align-top`}>
                        <input
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          autoFocus
                          className={fieldClass}
                        />
                      </td>
                      <td className={`${tdClass} align-top`}>
                        <UrlPicker
                          categories={categories}
                          urlChoice={editUrlChoice}
                          onUrlChoiceChange={setEditUrlChoice}
                          customUrl={editCustomUrl}
                          onCustomUrlChange={setEditCustomUrl}
                        />
                        {editError && <p className="mt-1 text-xs text-red-400">{editError}</p>}
                      </td>
                      <td className={`${tdClass} text-right align-top whitespace-nowrap`}>
                        <button
                          onClick={() => handleSaveEdit(item.id)}
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
                      <td className={`${tdClass} font-semibold`}>{item.label}</td>
                      <td className={`${tdClass} text-muted`}>{item.url}</td>
                      <td className={`${tdClass} whitespace-nowrap`}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => moveItem(index, -1)}
                            disabled={index === 0 || movingId !== null}
                            title="Дээш"
                            aria-label="Дээш"
                            className={iconButtonEditClass}
                          >
                            <ArrowUpIcon />
                          </button>
                          <button
                            onClick={() => moveItem(index, 1)}
                            disabled={index === initial.length - 1 || movingId !== null}
                            title="Доош"
                            aria-label="Доош"
                            className={iconButtonEditClass}
                          >
                            <ArrowDownIcon />
                          </button>
                          <button
                            onClick={() => startEdit(item)}
                            title="Засах"
                            aria-label="Засах"
                            className={iconButtonEditClass}
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
