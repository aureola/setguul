"use client";

import { useRef, useState } from "react";
import ColorPickerPopover from "../ColorPickerPopover";
import { ChevronDownIcon } from "../ui/editor-icons";

export default function ColorSplitButton({
  label,
  icon,
  color,
  active,
  onPick,
  onClear,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  active?: boolean;
  onPick: (color: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative flex items-stretch rounded-md">
      <button
        ref={triggerRef}
        type="button"
        title={label}
        aria-label={label}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-8 items-center gap-1 px-1.5 text-sm font-semibold transition hover:bg-border ${
          active ? "bg-accent text-accent-contrast hover:bg-accent" : "text-foreground"
        }`}
      >
        <span className="flex flex-col items-center gap-0.5">
          {icon}
          <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: color }} />
        </span>
        <ChevronDownIcon className="h-3 w-3 text-muted" />
      </button>
      {open && (
        <ColorPickerPopover
          excludeRef={triggerRef}
          onPick={onPick}
          onClear={onClear}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
