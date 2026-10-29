"use client";

import { useState } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="И-мэйл хаяг"
        className="w-full rounded-md border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 rounded-md bg-accent px-5 py-3 text-sm font-bold text-accent-contrast hover:opacity-90 disabled:opacity-60"
      >
        {status === "loading" ? "..." : "БҮРТГҮҮЛЭХ →"}
      </button>
      {status === "done" && (
        <span className="sr-only">Амжилттай бүртгэгдлээ</span>
      )}
    </form>
  );
}
