"use client";

import { useState } from "react";
import { CloseIcon } from "./ui/editor-icons";
import { buttonPrimaryClass, buttonSecondaryClass, fieldClass } from "./ui/styles";

export interface LinkModalResult {
  url: string;
  text: string;
  openInNewTab: boolean;
}

export default function LinkModal({
  initialUrl,
  initialText,
  initialOpenInNewTab,
  showRemove,
  onClose,
  onInsert,
  onRemove,
}: {
  initialUrl: string;
  initialText: string;
  initialOpenInNewTab: boolean;
  showRemove: boolean;
  onClose: () => void;
  onInsert: (result: LinkModalResult) => void;
  onRemove: () => void;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const [openInNewTab, setOpenInNewTab] = useState(initialOpenInNewTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex w-full max-w-md flex-col rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold">Холбоос</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted transition hover:bg-border hover:text-foreground"
            aria-label="Хаах"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-5 py-4">
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            URL
            <input
              type="url"
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className={fieldClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Текст
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Холбоосны харагдах текст"
              className={fieldClass}
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={openInNewTab}
              onChange={(e) => setOpenInNewTab(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-accent"
            />
            Шинэ табаар нээх
          </label>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          {showRemove ? (
            <button type="button" onClick={onRemove} className="text-sm font-semibold text-red-400 transition hover:underline">
              Холбоос устгах
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={buttonSecondaryClass}>
              Цуцлах
            </button>
            <button
              type="button"
              disabled={!url.trim()}
              onClick={() => onInsert({ url: url.trim(), text: text.trim(), openInNewTab })}
              className={buttonPrimaryClass}
            >
              Оруулах
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
