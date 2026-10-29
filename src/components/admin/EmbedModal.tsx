"use client";

import { useState } from "react";
import { CloseIcon } from "./ui/editor-icons";
import { buttonPrimaryClass, buttonSecondaryClass } from "./ui/styles";
import { extractEmbedSrc } from "@/lib/embed";

export default function EmbedModal({
  onClose,
  onInsert,
}: {
  onClose: () => void;
  onInsert: (src: string) => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleInsert() {
    const src = extractEmbedSrc(code);
    if (!src) {
      setError(
        "Энэ кодыг оруулах боломжгүй. Зөвхөн YouTube, Vimeo, SoundCloud, Spotify, Google Maps-ийн embed код эсвэл холбоос дэмжигдэнэ.",
      );
      return;
    }
    onInsert(src);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex w-full max-w-xl flex-col rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold">Embed код оруулах</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted transition hover:bg-border hover:text-foreground"
            aria-label="Хаах"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col gap-2 px-5 py-4">
          <label htmlFor="embed-code" className="text-sm text-muted">
            &lt;iframe&gt; embed код эсвэл шууд холбоос (YouTube, Vimeo, SoundCloud, Spotify, Google Maps)
          </label>
          <textarea
            id="embed-code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (error) setError(null);
            }}
            rows={6}
            spellCheck={false}
            placeholder='<iframe width="560" height="315" src="https://www.youtube.com/embed/..." ...></iframe>'
            className="w-full rounded-lg border border-border bg-background/40 px-3 py-2.5 font-mono text-sm outline-none focus:border-accent"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <button type="button" onClick={onClose} className={buttonSecondaryClass}>
            Цуцлах
          </button>
          <button type="button" disabled={!code.trim()} onClick={handleInsert} className={buttonPrimaryClass}>
            Оруулах
          </button>
        </div>
      </div>
    </div>
  );
}
