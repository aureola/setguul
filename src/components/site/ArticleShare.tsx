"use client";

import { useState } from "react";
import { FacebookFIcon, XLogoIcon } from "./SocialIcons";

export default function ArticleShare({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  async function copyLink() {
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
      <span className="font-bold text-muted">Хуваалцах:</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook дээр хуваалцах"
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1877F2] text-white transition hover:opacity-90"
      >
        <FacebookFIcon className="h-5 w-5" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X дээр хуваалцах"
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white transition hover:opacity-90"
      >
        <XLogoIcon className="h-5 w-5" />
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="rounded-full border border-border px-4 py-2 font-semibold transition hover:border-accent hover:text-accent"
      >
        {copied ? "Хууллаа" : "Холбоос хуулах"}
      </button>
      {copyError && (
        <span role="status" className="text-sm text-muted">
          Холбоос хуулахад алдаа гарлаа.
        </span>
      )}
    </div>
  );
}
