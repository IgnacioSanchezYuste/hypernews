"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Standalone search input used on the /buscar page. */
export function SearchBox({ initial = "" }: { initial?: string }) {
  const [q, setQ] = useState(initial);
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/buscar?q=${encodeURIComponent(q.trim())}` : "/buscar");
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2 rounded-full border border-hair bg-surface px-5 py-1.5 focus-within:border-[var(--accent)]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-subtle" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Busca artículos, categorías, autores o recursos…"
        aria-label="Buscar"
        className="w-full bg-transparent py-2.5 text-base outline-none placeholder:text-subtle"
      />
      <button type="submit" className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-fg)]">Buscar</button>
    </form>
  );
}
