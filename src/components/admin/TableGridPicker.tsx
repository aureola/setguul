"use client";

import { useState } from "react";

const MAX_ROWS = 8;
const MAX_COLS = 8;

export default function TableGridPicker({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (rows: number, cols: number) => void;
}) {
  const [hover, setHover] = useState<{ rows: number; cols: number }>({ rows: 0, cols: 0 });

  return (
    <div className="absolute left-0 top-full z-20 mt-1 rounded-xl border border-border bg-surface p-3 shadow-xl">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${MAX_COLS}, 1.25rem)` }}
        onMouseLeave={() => setHover({ rows: 0, cols: 0 })}
      >
        {Array.from({ length: MAX_ROWS * MAX_COLS }, (_, i) => {
          const row = Math.floor(i / MAX_COLS) + 1;
          const col = (i % MAX_COLS) + 1;
          const active = row <= hover.rows && col <= hover.cols;
          return (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHover({ rows: row, cols: col })}
              onClick={() => {
                onPick(row, col);
                onClose();
              }}
              className={`h-5 w-5 rounded-sm border transition ${
                active ? "border-accent bg-accent/40" : "border-border bg-background/40"
              }`}
            />
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-muted">
        {hover.rows} x {hover.cols}
      </p>
    </div>
  );
}
