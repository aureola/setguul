"use client";

import { buttonDangerClass, buttonPrimaryClass, buttonSecondaryClass } from "./ui/styles";

export default function ConfirmModal({
  title = "Баталгаажуулах",
  message,
  confirmLabel = "Устгах",
  cancelLabel = "Цуцлах",
  danger = true,
  onConfirm,
  onCancel,
}: {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface">
        <div className="px-5 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="mt-2 text-sm text-muted">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <button type="button" onClick={onCancel} className={buttonSecondaryClass}>
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className={danger ? buttonDangerClass : buttonPrimaryClass}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
