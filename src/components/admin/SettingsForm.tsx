"use client";

import { useState } from "react";
import Card from "./ui/Card";
import { fieldClass, buttonPrimaryClass } from "./ui/styles";

export default function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <Card className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block text-sm font-semibold">
          Сайтын нэр
          <input
            value={values.site_title ?? ""}
            onChange={(e) => update("site_title", e.target.value)}
            className={`mt-1.5 font-normal ${fieldClass}`}
          />
        </label>

        <label className="block text-sm font-semibold">
          Тагline
          <input
            value={values.site_tagline ?? ""}
            onChange={(e) => update("site_tagline", e.target.value)}
            className={`mt-1.5 font-normal ${fieldClass}`}
          />
        </label>

        <label className="block text-sm font-semibold">
          Акцент өнгө
          <div className="mt-1.5 flex items-center gap-3">
            <input
              type="color"
              value={values.accent_color ?? "#F2C21C"}
              onChange={(e) => update("accent_color", e.target.value)}
              className="h-10 w-16 rounded-lg border border-border bg-transparent"
            />
            <input
              value={values.accent_color ?? ""}
              onChange={(e) => update("accent_color", e.target.value)}
              className={`font-normal ${fieldClass}`}
            />
          </div>
        </label>

        <label className="flex items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={values.show_view_count === "true"}
            onChange={(e) => update("show_view_count", e.target.checked ? "true" : "false")}
            className="mt-0.5 h-4 w-4 rounded border-border accent-accent"
          />
          Уншсан тоог admin эрхээр нэвтэрсэн хэрэглэгчид мэдээний хуудсанд харуулах
        </label>

        <label className="flex items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={values.comments_enabled === "true"}
            onChange={(e) => update("comments_enabled", e.target.checked ? "true" : "false")}
            className="mt-0.5 h-4 w-4 rounded border-border accent-accent"
          />
          Сэтгэгдэл бичих боломжийг бүх мэдээнд үндсэн тохиргоогоор зөвшөөрөх (тус мэдээ бүрт энэхүү тохиргоог дарж болно)
        </label>

        <label className="block text-sm font-semibold">
          Мэдээний URL хэлбэр
          <select
            value={values.article_url_mode === "id" ? "id" : "slug"}
            onChange={(e) => update("article_url_mode", e.target.value)}
            className={`mt-1.5 font-normal ${fieldClass}`}
          >
            <option value="slug">Slug (жишээ: /news/mongol-uls-...)</option>
            <option value="id">ID дугаар (жишээ: /news/10238)</option>
          </select>
        </label>

        <label className="block text-sm font-semibold">
          Хөлийн текст
          <textarea
            value={values.footer_text ?? ""}
            onChange={(e) => update("footer_text", e.target.value)}
            rows={2}
            className={`mt-1.5 font-normal ${fieldClass}`}
          />
        </label>

        <div className="flex items-center gap-3 border-t border-border pt-5">
          <button type="submit" disabled={saving} className={buttonPrimaryClass}>
            {saving ? "Хадгалж байна..." : "Хадгалах"}
          </button>
          {saved && <span className="text-sm font-semibold text-accent">Хадгалагдлаа</span>}
        </div>
      </form>
    </Card>
  );
}
