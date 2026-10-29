"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

const PRESET_COLORS = [
  "#f2c21c",
  "#ef4444",
  "#f97316",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#f5f5f5",
  "#6b7280",
];

export default function ColorPickerPopover({
  onPick,
  onClear,
  onClose,
  excludeRef,
}: {
  onPick: (color: string) => void;
  onClear: () => void;
  onClose: () => void;
  /** The trigger button that opened this popover — clicks on it are its own
   * toggle handler's responsibility, not an "outside click" close. */
  excludeRef?: RefObject<HTMLElement | null>;
}) {
  const customInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  // The native <input type="color"> picker (gradient/hue/RGB panel) is, in
  // modern Chromium, rendered as real "top layer" DOM outside this
  // component's tree, so interacting with it still fires document-level
  // pointerdown events. Without this guard, every drag inside it reads as an
  // "outside click" and immediately closes (and unmounts) this popover.
  const pickingCustomColorRef = useRef(false);
  // Hides this popover's own swatch grid/buttons while the native color
  // picker is open, so it doesn't still sit behind it and reappear the
  // moment the native picker is dismissed.
  const [pickingCustom, setPickingCustom] = useState(false);

  // A full-screen backdrop would block clicks on sibling toggle buttons (e.g.
  // switching straight from the text-color picker to the highlight picker),
  // so detect outside clicks instead of intercepting them.
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (pickingCustomColorRef.current) return;
      const target = e.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (excludeRef?.current?.contains(target)) return;
      onClose();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [onClose, excludeRef]);

  return (
    <div
      ref={popoverRef}
      className={`absolute left-0 top-full z-20 mt-1 ${
        pickingCustom ? "" : "w-48 rounded-xl border border-border bg-surface p-3 shadow-xl"
      }`}
    >
      {!pickingCustom && (
        <>
          <div className="grid grid-cols-5 gap-1.5">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                onClick={() => {
                  onPick(color);
                  onClose();
                }}
                className="h-6 w-6 rounded-full border border-border transition hover:scale-110"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                pickingCustomColorRef.current = true;
                setPickingCustom(true);
                customInputRef.current?.click();
              }}
              className="flex h-7 flex-1 items-center justify-center rounded-md border border-border text-xs font-semibold transition hover:border-accent"
            >
              Бусад...
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              onClear();
              onClose();
            }}
            className="mt-2 w-full rounded-md border border-border py-1.5 text-xs font-semibold text-muted transition hover:border-accent hover:text-accent"
          >
            Арилгах
          </button>
        </>
      )}
      <input
        ref={customInputRef}
        type="color"
        className="sr-only"
        // React's onChange maps to the native "input" event, which fires
        // continuously while dragging inside the gradient/hue panel — so
        // this only applies the live preview. Closing happens on "blur",
        // once the native picker itself is actually dismissed.
        onChange={(e) => onPick(e.target.value)}
        onBlur={() => {
          // Release the guard and close on the next tick, after the
          // pointerdown/blur that closed the native picker has finished
          // propagating, so it isn't also read as this popover's own
          // outside click.
          setTimeout(() => {
            pickingCustomColorRef.current = false;
            onClose();
          }, 0);
        }}
      />
    </div>
  );
}
