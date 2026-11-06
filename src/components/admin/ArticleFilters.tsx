"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Card from "./ui/Card";
import { fieldClass, selectClass, buttonPrimaryClass, buttonSecondaryClass } from "./ui/styles";
import { ChevronDownIcon } from "./ui/icons";

interface AuthorOption {
  id: string;
  name: string;
}

export default function ArticleFilters({ authors }: { authors: AuthorOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasActiveFilters = ["q", "author", "from", "to"].some((key) => searchParams.get(key));
  const [open, setOpen] = useState(hasActiveFilters);

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [author, setAuthor] = useState(searchParams.get("author") ?? "");
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (author) params.set("author", author);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(params.size ? `${pathname}?${params.toString()}` : pathname);
  }

  function reset() {
    setQ("");
    setAuthor("");
    setFrom("");
    setTo("");
    router.push(pathname);
  }

  return (
    <Card className="mb-4 !p-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left font-semibold"
      >
        <span>Хайх{hasActiveFilters ? " (идэвхтэй)" : ""}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <form onSubmit={apply} className="flex flex-wrap items-end gap-3 border-t border-border px-6 py-4">
          <div>
            <label className="mb-1 block text-xs text-muted">Гарчгаар хайх</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Гарчиг..."
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Админ</label>
            <select value={author} onChange={(e) => setAuthor(e.target.value)} className={selectClass}>
              <option value="">Бүгд</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Эхлэх огноо</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Дуусах огноо</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={fieldClass} />
          </div>
          <button type="submit" className={buttonPrimaryClass}>
            Хайх
          </button>
          <button type="button" onClick={reset} className={buttonSecondaryClass}>
            Цэвэрлэх
          </button>
        </form>
      )}
    </Card>
  );
}
