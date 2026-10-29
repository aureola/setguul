"use client";

import { useState } from "react";
import { CloseIcon } from "./ui/editor-icons";
import { buttonPrimaryClass, buttonSecondaryClass } from "./ui/styles";

export default function HtmlCodeModal({
  initialHtml,
  onClose,
  onApply,
}: {
  initialHtml: string;
  onClose: () => void;
  onApply: (html: string) => void;
}) {
  const [html, setHtml] = useState(initialHtml);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[85vh] w-full flex-col rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold">HTML код</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted transition hover:bg-border hover:text-foreground"
            aria-label="Хаах"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={16}
            spellCheck={false}
            className="w-full rounded-lg border border-border bg-background/40 px-3 py-2.5 font-mono text-xs outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <button type="button" onClick={onClose} className={buttonSecondaryClass}>
            Цуцлах
          </button>
          <button type="button" onClick={() => onApply(html)} className={buttonPrimaryClass}>
            Хэрэглэх
          </button>
        </div>
      </div>
    </div>
  );
}
