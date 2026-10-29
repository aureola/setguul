"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ImageUploader from "./ImageUploader";
import VideoUploader from "./VideoUploader";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import {
  fieldClass,
  selectClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
  linkActionClass,
  iconButtonEditClass,
  iconButtonDangerClass,
} from "./ui/styles";
import { TrashIcon, EditIcon } from "./ui/icons";
import { useConfirm } from "./useConfirm";

type BannerType = "IMAGE" | "VIDEO" | "EMBED";

interface Banner {
  id: string;
  title: string;
  type: BannerType;
  imageUrl: string | null;
  videoUrl: string | null;
  embedHtml: string | null;
  linkUrl: string | null;
  position: string;
  isActive: boolean;
}

const POSITIONS = [
  { value: "home_top", label: "Нүүр хуудас" },
  { value: "article_sidebar", label: "Мэдээний sidebar" },
];

const TYPES: { value: BannerType; label: string }[] = [
  { value: "IMAGE", label: "Зураг" },
  { value: "VIDEO", label: "Видео" },
  { value: "EMBED", label: "HTML" },
];

function BannerPreview({ banner }: { banner: Banner }) {
  if (banner.type === "VIDEO" && banner.videoUrl) {
    return <video src={banner.videoUrl} className="h-full w-full object-cover" muted loop autoPlay playsInline />;
  }
  if (banner.type === "EMBED" && banner.embedHtml) {
    return <div className="h-full w-full overflow-hidden" dangerouslySetInnerHTML={{ __html: banner.embedHtml }} />;
  }
  if (banner.imageUrl) {
    return <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover" />;
  }
  return null;
}

function BannerEditor({
  initial,
  order,
  onSaved,
  onCancel,
}: {
  initial?: Banner;
  order: number;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl ?? "");
  const [type, setType] = useState<BannerType>(initial?.type ?? "IMAGE");
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [videoUrl, setVideoUrl] = useState<string | null>(initial?.videoUrl ?? null);
  const [embedHtml, setEmbedHtml] = useState(initial?.embedHtml ?? "");
  const [position, setPosition] = useState(initial?.position ?? POSITIONS[0].value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (type === "IMAGE" && !imageUrl) {
      setError("Зураг оруулна уу");
      return;
    }
    if (type === "VIDEO" && !videoUrl) {
      setError("Видео оруулна уу");
      return;
    }
    if (type === "EMBED" && !embedHtml.trim()) {
      setError("HTML код оруулна уу");
      return;
    }

    setSaving(true);
    setError(null);

    const payload: Record<string, unknown> = {
      title,
      type,
      linkUrl: linkUrl || null,
      position,
      imageUrl: type === "IMAGE" ? imageUrl : null,
      videoUrl: type === "VIDEO" ? videoUrl : null,
      embedHtml: type === "EMBED" ? embedHtml : null,
    };
    if (!initial) payload.order = order;

    const res = await fetch(initial ? `/api/admin/banners/${initial.id}` : "/api/admin/banners", {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      setError(initial ? "Хадгалахад алдаа гарлаа" : "Нэмэхэд алдаа гарлаа");
      return;
    }

    if (!initial) {
      setTitle("");
      setLinkUrl("");
      setImageUrl(null);
      setVideoUrl(null);
      setEmbedHtml("");
    }
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!initial && <h2 className="font-bold">Шинэ баннер</h2>}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder="Гарчиг"
        className={fieldClass}
      />
      <input
        value={linkUrl}
        onChange={(e) => setLinkUrl(e.target.value)}
        placeholder="Холбоос (сонголттой)"
        className={fieldClass}
      />

      <div className="flex gap-1.5 rounded-lg border border-border bg-background/40 p-1">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition ${
              type === t.value ? "bg-accent text-accent-contrast" : "text-foreground hover:bg-border"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {type === "IMAGE" && <ImageUploader label="Зураг" value={imageUrl} onChange={setImageUrl} />}
      {type === "VIDEO" && <VideoUploader label="Видео" value={videoUrl} onChange={setVideoUrl} />}
      {type === "EMBED" && (
        <label className="block text-sm font-semibold">
          HTML код
          <textarea
            value={embedHtml}
            onChange={(e) => setEmbedHtml(e.target.value)}
            rows={6}
            spellCheck={false}
            placeholder='<iframe src="..."></iframe> эсвэл <video>...</video>'
            className={`mt-1.5 font-mono text-xs ${fieldClass}`}
          />
        </label>
      )}

      <select value={position} onChange={(e) => setPosition(e.target.value)} className={selectClass}>
        {POSITIONS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className={`flex-1 ${buttonPrimaryClass}`}>
          {saving ? "Хадгалж байна..." : initial ? "Хадгалах" : "Нэмэх"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={buttonSecondaryClass}>
            Цуцлах
          </button>
        )}
      </div>
    </form>
  );
}

export default function BannerManager({ initial }: { initial: Banner[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/banners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!(await confirm("Устгах уу?"))) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {ConfirmDialog}
      <Card className="max-w-md">
        <BannerEditor order={initial.length} onSaved={() => router.refresh()} />
      </Card>

      {initial.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted">
          Баннер алга байна.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {initial.map((b) =>
            editingId === b.id ? (
              <Card key={b.id} className="col-span-2 max-w-md p-4 md:col-span-1">
                <BannerEditor
                  initial={b}
                  order={initial.length}
                  onSaved={() => {
                    setEditingId(null);
                    router.refresh();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              </Card>
            ) : (
              <Card key={b.id} className="p-3">
                <div className="relative mb-2 h-28 w-full overflow-hidden rounded-lg bg-black/20">
                  <BannerPreview banner={b} />
                </div>
                <p className="mb-1 truncate font-semibold">{b.title}</p>
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant={b.isActive ? "accent" : "muted"}>{b.isActive ? "Идэвхтэй" : "Идэвхгүй"}</Badge>
                  <span className="text-xs text-muted">{TYPES.find((t) => t.value === b.type)?.label}</span>
                  <span className="text-xs text-muted">
                    {POSITIONS.find((p) => p.value === b.position)?.label ?? b.position}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <button onClick={() => toggleActive(b.id, b.isActive)} className={linkActionClass}>
                    {b.isActive ? "Идэвхгүй болгох" : "Идэвхжүүлэх"}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingId(b.id)}
                      title="Засах"
                      aria-label="Засах"
                      className={iconButtonEditClass}
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      title="Устгах"
                      aria-label="Устгах"
                      className={iconButtonDangerClass}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </Card>
            ),
          )}
        </div>
      )}
    </div>
  );
}
