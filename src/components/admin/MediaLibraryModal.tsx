"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CloseIcon, CheckCircleIcon } from "./ui/editor-icons";
import { buttonPrimaryClass, buttonSecondaryClass } from "./ui/styles";

export default function MediaLibraryModal({
  initialFiles,
  onClose,
  onInsert,
}: {
  initialFiles: string[];
  onClose: () => void;
  onInsert: (urls: string[]) => void;
}) {
  const [files, setFiles] = useState<string[]>(initialFiles);
  const [selected, setSelected] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function toggle(url: string) {
    setSelected((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]));
  }

  async function handleUpload(fileList: FileList) {
    setUploading(true);
    setError(null);
    const uploaded: string[] = [];
    for (const file of Array.from(fileList)) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        uploaded.push(data.url);
      }
    }
    setUploading(false);
    if (uploaded.length === 0) {
      setError("Зураг хуулахад алдаа гарлаа");
      return;
    }
    setFiles((prev) => [...uploaded, ...prev]);
    setSelected((prev) => [...uploaded, ...prev]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold">Файлын сан</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted transition hover:bg-border hover:text-foreground"
            aria-label="Хаах"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={buttonSecondaryClass}
          >
            {uploading ? "Хуулж байна..." : "+ Шинэ зураг хуулах"}
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
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {files.length === 0 ? (
            <p className="text-sm text-muted">Энэ мэдээнд одоогоор зураг алга байна.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {files.map((url) => {
                const isSelected = selected.includes(url);
                return (
                  <button
                    key={url}
                    type="button"
                    onClick={() => toggle(url)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 bg-black/20 transition ${
                      isSelected ? "border-accent" : "border-transparent hover:border-border"
                    }`}
                  >
                    <Image src={url} alt="" fill sizes="150px" className="object-cover" />
                    {isSelected && (
                      <span className="absolute right-1.5 top-1.5 rounded-full bg-accent text-accent-contrast">
                        <CheckCircleIcon className="h-5 w-5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <span className="text-sm text-muted">{selected.length} зураг сонгогдсон</span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={buttonSecondaryClass}>
              Цуцлах
            </button>
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={() => onInsert(selected)}
              className={buttonPrimaryClass}
            >
              Оруулах ({selected.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
