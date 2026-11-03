"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [visibleMenuCount, setVisibleMenuCount] = useState(menuItems.length);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const nav = desktopNavRef.current;
    const measure = measureRef.current;
    if (!nav || !measure) return;

    function updateVisibleMenuCount() {
      if (nav.clientWidth === 0) return;

      const navStyle = window.getComputedStyle(nav);
      const availableWidth =
        nav.clientWidth -
        Number.parseFloat(navStyle.paddingLeft) -
        Number.parseFloat(navStyle.paddingRight);
      const gap = Number.parseFloat(navStyle.columnGap) || 0;
      const measuredItems = Array.from(
        measure.querySelectorAll<HTMLElement>("[data-menu-measure]"),
      );
      const itemWidths = measuredItems
        .filter((item) => item.dataset.menuMeasure !== "more")
        .map((item) => item.getBoundingClientRect().width);
      const moreWidth =
        measuredItems.find((item) => item.dataset.menuMeasure === "more")?.getBoundingClientRect().width ?? 0;

      const allItemsWidth =
        itemWidths.reduce((total, width) => total + width, 0) +
        Math.max(0, itemWidths.length - 1) * gap;

      if (allItemsWidth <= availableWidth) {
        setVisibleMenuCount(itemWidths.length);
        return;
      }

      let usedWidth = moreWidth;
      let visibleCount = 0;
      for (const width of itemWidths) {
        const nextWidth = usedWidth + gap + width;
        if (nextWidth > availableWidth) break;
        usedWidth = nextWidth;
        visibleCount += 1;
      }
      setVisibleMenuCount(visibleCount);
    }

    updateVisibleMenuCount();
    const observer = new ResizeObserver(updateVisibleMenuCount);
    observer.observe(nav);
    observer.observe(measure);
    return () => observer.disconnect();
  }, [menuItems]);

  useEffect(() => {
    if (!moreOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !moreMenuRef.current?.contains(event.target)) {
        setMoreOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMoreOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen]);

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
        <Link href="/" className="flex shrink-0 items-center" onClick={() => setOpen(false)}>
          <Image
            src="/setguullogo.png"
            alt={siteTitle}
            width={500}
            height={122}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav
          ref={desktopNavRef}
          aria-label="Үндсэн цэс"
          className="relative hidden min-w-0 flex-1 items-center gap-4 overflow-visible pl-6 text-xs font-semibold tracking-wide md:flex lg:gap-5 lg:text-sm"
        >
          {menuItems.slice(0, visibleMenuCount).map((item) => (
            <Link key={item.id} href={item.url} className="shrink-0 whitespace-nowrap uppercase hover:text-accent">
              {item.label}
            </Link>
          ))}
          {visibleMenuCount < menuItems.length && (
            <div
              ref={moreMenuRef}
              className="relative shrink-0"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
              onBlur={(event) => {
                if (
                  !(event.relatedTarget instanceof Node) ||
                  !event.currentTarget.contains(event.relatedTarget)
                ) {
                  setMoreOpen(false);
                }
              }}
            >
              <button
                type="button"
                aria-expanded={moreOpen}
                aria-controls="site-more-menu"
                onFocus={() => setMoreOpen(true)}
                className="flex items-center gap-1 whitespace-nowrap uppercase hover:text-accent"
              >
                Бусад
                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
                  <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              {moreOpen && (
                <div
                  id="site-more-menu"
                  className="absolute right-0 top-full z-50 max-h-[70vh] min-w-48 overflow-y-auto rounded-md border border-border bg-background p-2 text-sm shadow-lg"
                >
                  {menuItems.slice(visibleMenuCount).map((item) => (
                    <Link
                      key={item.id}
                      href={item.url}
                      onClick={() => setMoreOpen(false)}
                      className="block rounded px-3 py-2 uppercase hover:bg-border/40 hover:text-accent"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
          <div
            ref={measureRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 flex w-max items-center gap-4 pl-6 text-xs font-semibold tracking-wide invisible lg:gap-5 lg:text-sm"
          >
            {menuItems.map((item) => (
              <span key={item.id} data-menu-measure className="shrink-0 whitespace-nowrap uppercase">
                {item.label}
              </span>
            ))}
            <span data-menu-measure="more" className="flex shrink-0 items-center gap-1 whitespace-nowrap uppercase">
              Бусад
              <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
                <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-4">
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
