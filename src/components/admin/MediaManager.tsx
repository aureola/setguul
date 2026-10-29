"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Card from "./ui/Card";
import { TrashIcon, FolderIcon, ChevronLeftIcon } from "./ui/icons";
import { buttonSecondaryClass, fieldClass, iconButtonDangerClass } from "./ui/styles";
import { formatDateTime } from "@/lib/format";
import { useConfirm } from "./useConfirm";

interface MediaUsage {
  type: "article" | "banner";
  id: string;
  title: string;
}

interface MediaFile {
  url: string;
  size: number;
  mtime: string;
  usedBy: MediaUsage[];
}

function getFolder(url: string): string {
  const parts = url.split("/").filter(Boolean); // ["uploads", "2026", "10", "27", "file.png"]
  return parts.slice(1, -1).join("/"); // "2026/10/27"
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileCard({
  file,
  onDeleted,
}: {
  file: MediaFile;
  onDeleted: (url: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [blockedUsage, setBlockedUsage] = useState<MediaUsage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  async function performDelete(force: boolean) {
    setDeleting(true);
    setError(null);
    const res = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: file.url, force }),
    });
    setDeleting(false);

    if (res.status === 409) {
      const data = await res.json().catch(() => null);
      setBlockedUsage(data?.usedBy ?? []);
      return;
    }

    if (!res.ok) {
      setError("Устгахад алдаа гарлаа");
      return;
    }

    onDeleted(file.url);
  }

  async function handleDeleteClick() {
    if (!(await confirm("Энэ файлыг устгахдаа итгэлтэй байна уу?"))) return;
    performDelete(false);
  }

  const filename = file.url.split("/").pop();

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {ConfirmDialog}
      <div className="relative aspect-square bg-background/40">
        <Image src={file.url} alt={filename ?? ""} fill sizes="200px" className="object-cover" />
      </div>
      <div className="space-y-1.5 p-2.5">
        <p className="truncate text-xs font-semibold" title={filename}>
          {filename}
        </p>
        <p className="text-[11px] text-muted">
          {formatSize(file.size)} · {formatDateTime(file.mtime)}
        </p>
        {file.usedBy.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {file.usedBy.map((u, i) => (
              <span
                key={`${u.type}-${u.id}-${i}`}
                className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent"
                title={u.title}
              >
                {u.type === "article" ? "Мэдээ" : "Баннер"}
              </span>
            ))}
          </div>
        ) : (
          <span className="rounded-full bg-border px-1.5 py-0.5 text-[10px] font-semibold text-muted">
            Ашиглаагүй
          </span>
        )}

        {error && <p className="text-[11px] text-red-400">{error}</p>}

        {blockedUsage ? (
          <div className="space-y-1.5 rounded-lg border border-red-500/40 bg-red-500/10 p-2">
            <p className="text-[11px] font-semibold text-red-400">
              Энэ файл дараах зүйлд ашиглагдаж байна:
            </p>
            <ul className="space-y-0.5 text-[11px] text-red-300">
              {blockedUsage.map((u, i) => (
                <li key={i}>
                  {u.type === "article" ? "Мэдээ" : "Баннер"}: {u.title}
                </li>
              ))}
            </ul>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setBlockedUsage(null)}
                className="flex-1 rounded-md border border-border py-1 text-[11px] font-semibold transition hover:border-accent"
              >
                Цуцлах
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => performDelete(true)}
                className="flex-1 rounded-md border border-red-500/40 py-1 text-[11px] font-semibold text-red-400 transition hover:bg-red-500/10"
              >
                Заавал устгах
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={deleting}
            onClick={handleDeleteClick}
            title="Устгах"
            aria-label="Устгах"
            className={`${iconButtonDangerClass} w-full`}
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  );
}

export default function MediaManager({ initial }: { initial: MediaFile[] }) {
  const [files, setFiles] = useState(initial);
  const [search, setSearch] = useState("");
  const [onlyUnused, setOnlyUnused] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSearching = search.trim().length > 0 || onlyUnused;

  const folders = useMemo(() => {
    const map = new Map<string, MediaFile[]>();
    for (const file of files) {
      const folder = getFolder(file.url);
      const list = map.get(folder) ?? [];
      list.push(file);
      map.set(folder, list);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [files]);

  const filtered = useMemo(() => {
    return files.filter((f) => {
      if (onlyUnused && f.usedBy.length > 0) return false;
      if (search && !f.url.toLowerCase().includes(search.toLowerCase())) return false;
      if (!isSearching && currentFolder !== null && getFolder(f.url) !== currentFolder) return false;
      return true;
    });
  }, [files, search, onlyUnused, currentFolder, isSearching]);

  function handleDeleted(url: string) {
    setFiles((prev) => prev.filter((f) => f.url !== url));
  }

  async function handleUpload(fileList: FileList) {
    setUploading(true);
    setError(null);
    const uploaded: MediaFile[] = [];
    for (const file of Array.from(fileList)) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        uploaded.push({ url: data.url, size: file.size, mtime: new Date().toISOString(), usedBy: [] });
      }
    }
    setUploading(false);
    if (uploaded.length === 0) {
      setError("Зураг хуулахад алдаа гарлаа");
      return;
    }
    setFiles((prev) => [...uploaded, ...prev]);
  }

  return (
    <div className="space-y-5">
      <Card className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Файлын нэрээр хайх..."
          className={`max-w-xs ${fieldClass}`}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyUnused}
            onChange={(e) => setOnlyUnused(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-accent"
          />
          Зөвхөн ашиглаагүй файлууд
        </label>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-muted">
            {!isSearching && currentFolder === null ? `${files.length} файл` : `${filtered.length} файл`}
          </span>
          <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className={buttonSecondaryClass}>
            {uploading ? "Хуулж байна..." : "+ Файл оруулах"}
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) handleUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </Card>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {!isSearching && currentFolder !== null && (
        <button
          type="button"
          onClick={() => setCurrentFolder(null)}
          className="flex items-center gap-1.5 text-sm font-semibold text-accent transition hover:underline"
        >
          <ChevronLeftIcon />
          Хавтаснууд руу буцах · {currentFolder.replaceAll("/", ".")}
        </button>
      )}

      {!isSearching && currentFolder === null ? (
        folders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted">
            Файл олдсонгүй.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {folders.map(([folder, folderFiles]) => (
              <button
                key={folder}
                type="button"
                onClick={() => setCurrentFolder(folder)}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 text-center transition hover:border-accent"
              >
                <FolderIcon className="h-10 w-10 text-accent" />
                <span className="text-sm font-semibold">{folder.replaceAll("/", ".")}</span>
                <span className="text-xs text-muted">{folderFiles.length} файл</span>
              </button>
            ))}
          </div>
        )
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted">
          Файл олдсонгүй.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((file) => (
            <FileCard key={file.url} file={file} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}
