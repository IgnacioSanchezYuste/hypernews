"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Result = {
  type: "article" | "category" | "author" | "resource";
  title: string;
  subtitle: string;
  href: string;
  glyph?: string;
};

const RECENT_KEY = "hn-recent-searches";

/** Command-palette style instant search (⌘K / Ctrl+K). */
export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  /** localStorage is user-writable, so never trust its shape. */
  const readRecent = useCallback((): string[] => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
      return Array.isArray(parsed) ? parsed.filter((r): r is string => typeof r === "string").slice(0, 6) : [];
    } catch {
      return [];
    }
  }, []);

  const openDialog = useCallback(() => {
    setRecent(readRecent());
    setOpen(true);
  }, [readRecent]);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setQ("");
    setResults([]);
    setActive(0);
  }, []);

  // Open with ⌘K / Ctrl+K, close with Esc
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) closeDialog();
        else openDialog();
      }
      if (e.key === "Escape") closeDialog();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openDialog, closeDialog]);

  // Expose a global opener for the navbar button
  useEffect(() => {
    (window as unknown as { __openSearch?: () => void }).__openSearch = openDialog;
  }, [openDialog]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Debounced instant search
  useEffect(() => {
    const query = q.trim();
    if (!query) return;

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) return;
        const data = await res.json();
        setResults(Array.isArray(data.results) ? data.results : []);
        setActive(0);
      } catch {}
    }, 160);
    return () => clearTimeout(t);
  }, [q]);

  // Results belong to the query that produced them; while it is empty, show none.
  const shownResults = q.trim() ? results : [];

  const commit = useCallback(
    (href: string) => {
      if (q.trim()) {
        const next = [q.trim(), ...recent.filter((r) => r !== q.trim())].slice(0, 6);
        try {
          localStorage.setItem(RECENT_KEY, JSON.stringify(next));
        } catch {}
      }
      closeDialog();
      router.push(href);
    },
    [q, recent, router, closeDialog]
  );

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, shownResults.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === "Enter") {
      e.preventDefault();
      if (shownResults[active]) commit(shownResults[active].href);
      else if (q.trim()) commit(`/buscar?q=${encodeURIComponent(q.trim())}`);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[10vh]" role="dialog" aria-modal="true" aria-label="Buscar">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm animate-fade-up" onClick={closeDialog} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-hair bg-surface shadow-lift animate-fade-up">
        <div className="flex items-center gap-3 border-b border-hair px-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-subtle" aria-hidden>
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Busca artículos, temas o autores…"
            className="w-full bg-transparent py-4 text-base outline-none placeholder:text-subtle"
          />
          <kbd className="hidden shrink-0 rounded border border-hair px-1.5 py-0.5 text-[10px] text-subtle sm:block">ESC</kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {q.trim() === "" && (
            <div className="p-2">
              {recent.length > 0 && (
                <>
                  <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-subtle">Búsquedas recientes</p>
                  {recent.map((r) => (
                    <button key={r} onClick={() => setQ(r)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted">
                      <span className="text-subtle" aria-hidden>↺</span> {r}
                    </button>
                  ))}
                </>
              )}
              <p className="px-2 pt-3 pb-1.5 text-xs font-semibold uppercase tracking-wide text-subtle">Sugerencias</p>
              {["Inteligencia artificial", "Procrastinación", "Historia de Apple", "Hábitos"].map((s) => (
                <button key={s} onClick={() => setQ(s)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted">
                  <span className="text-subtle" aria-hidden>✦</span> {s}
                </button>
              ))}
            </div>
          )}

          {q.trim() !== "" && shownResults.length === 0 && (
            <p className="p-6 text-center text-sm text-muted">Sin resultados para “{q}”. Pulsa Enter para buscar de todos modos.</p>
          )}

          {shownResults.map((r, i) => (
            <button
              key={r.href + i}
              onMouseEnter={() => setActive(i)}
              onClick={() => commit(r.href)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${i === active ? "bg-muted" : ""}`}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30" aria-hidden>{r.glyph ?? "◆"}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{r.title}</span>
                <span className="block truncate text-xs text-muted">{r.subtitle}</span>
              </span>
              <span className="ml-auto text-[10px] uppercase text-subtle">{r.type}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-hair px-4 py-2 text-[11px] text-subtle">
          <span>↑↓ navegar · ↵ abrir</span>
          <Link href="/buscar" onClick={closeDialog} className="hover:text-fg">Búsqueda avanzada →</Link>
        </div>
      </div>
    </div>
  );
}
