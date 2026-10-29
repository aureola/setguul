"use client";

import { useEffect, useRef, useState } from "react";

interface Category {
  id: string;
  nameMn: string;
}

export default function CategoryTagSelect({
  categories,
  value,
  onChange,
}: {
  categories: Category[];
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = categories.filter((c) => value.includes(c.id));

  function remove(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => setOpen(true)}
        className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-lg border border-border bg-transparent px-2.5 py-2 transition focus-within:border-accent"
      >
        {selected.map((c) => (
          <span
            key={c.id}
            className="flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent"
          >
            {c.nameMn}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(c.id);
              }}
              className="leading-none text-accent/70 hover:text-accent"
              aria-label={`${c.nameMn}-г хасах`}
            >
              ×
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="px-1 text-sm text-muted hover:text-foreground"
        >
          {selected.length === 0 ? "Ангилал сонгох..." : "+ нэмэх"}
        </button>
      </div>

      {open && (
        <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-lg">
          {categories.map((c) => {
            const isSelected = value.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggle(c.id)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-border/60 ${
                  isSelected ? "text-muted" : "text-foreground"
                }`}
              >
                {c.nameMn}
                {isSelected && <span className="text-accent">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
