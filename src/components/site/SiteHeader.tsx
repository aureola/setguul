"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface MenuItem {
  id: string;
  label: string;
  url: string;
}

export default function SiteHeader({
  siteTitle,
  menuItems,
}: {
  siteTitle: string;
  menuItems: MenuItem[];
}) {
  const [mainWord, ...rest] = siteTitle.split(".");
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSearchOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setSearchOpen(false);
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <header className="relative border-b border-border/60">
      <div className="container-page flex h-20 items-center justify-between">
        <Link href="/" className="text-2xl font-extrabold tracking-tight" onClick={() => setOpen(false)}>
          <span className="text-accent">{mainWord}</span>
          {rest.length > 0 && (
            <span className="align-super text-xs text-foreground">.{rest.join(".")}</span>
          )}
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold tracking-wide md:flex">
          {menuItems.map((item) => (
            <Link key={item.id} href={item.url} className="uppercase hover:text-accent">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Хайх"
            onClick={() => setSearchOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:border-accent hover:text-accent"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Цэс"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-full border border-border md:hidden"
          >
            <span
              className={`block h-0.5 w-4 bg-foreground transition-transform ${open ? "translate-y-[3px] rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-4 bg-foreground transition-transform ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {open && (
        <nav className="absolute inset-x-0 top-full z-50 flex flex-col gap-1 border-t border-border/60 bg-background px-4 py-3 text-sm font-semibold tracking-wide shadow-lg md:hidden">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              onClick={() => setOpen(false)}
              className="rounded px-2 py-2 uppercase hover:bg-border/40 hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}

      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-background/95 px-4 pt-32 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Мэдээ хайх..."
                className="w-full rounded-md border border-border bg-transparent px-4 py-4 text-lg outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="rounded-md bg-accent px-6 py-4 text-sm font-bold text-accent-contrast"
              >
                Хайх
              </button>
            </form>
            <button
              type="button"
              aria-label="Хаах"
              onClick={() => setSearchOpen(false)}
              className="mt-4 text-sm font-semibold text-muted hover:text-accent"
            >
              Хаах ✕
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
