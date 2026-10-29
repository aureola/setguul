"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { TrashIcon } from "./ui/icons";

export default function ImageUploader({
  value,
  onChange,
  label,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    setUploading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Зураг оруулахад алдаа гарлаа");
      return;
    }

    const data = await res.json();
    onChange(data.url);
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-semibold">{label}</label>
      {value ? (
        <div className="relative mb-3 h-40 w-full max-w-xs overflow-hidden rounded-lg border border-border bg-black/20">
          <Image src={value} alt="" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            title="Устгах"
            aria-label="Устгах"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black/90"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="mb-3 flex h-40 w-full max-w-xs items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted">
          Зураггүй
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-border file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-foreground hover:file:bg-border/70"
      />
      {uploading && <p className="mt-1 text-xs text-muted">Хуулж байна...</p>}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
