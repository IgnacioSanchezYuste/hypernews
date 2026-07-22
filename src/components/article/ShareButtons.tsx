"use client";

import { useState } from "react";

/** Share bar: native share, X, LinkedIn, and copy-link with feedback. */
export function ShareButtons({ title, path, orientation = "horizontal" }: { title: string; path: string; orientation?: "horizontal" | "vertical" }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const url = typeof window !== "undefined" ? window.location.origin + path : path;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  async function nativeShare() {
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch {}
    } else {
      copy();
    }
  }

  const btn = "grid h-10 w-10 place-items-center rounded-full border border-hair text-muted transition-colors hover:border-strong hover:text-fg";
  const wrap = orientation === "vertical" ? "flex flex-col gap-2" : "flex flex-wrap items-center gap-2";

  return (
    <div className={wrap}>
      <button onClick={nativeShare} className={btn} aria-label="Compartir">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>
      </button>
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Compartir en X">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M18.9 2H22l-7 8 8.2 12h-6.4l-5-6.6L6 22H2.9l7.5-8.6L2.4 2h6.6l4.5 6z" /></svg>
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Compartir en LinkedIn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M4.98 3.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9z" /></svg>
      </a>
      <button onClick={() => setSaved((s) => !s)} className={`${btn} ${saved ? "!border-[var(--accent)] !text-[var(--accent)]" : ""}`} aria-label={saved ? "Quitar de favoritos" : "Guardar en favoritos"}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
      </button>
      <button onClick={copy} className={`${btn} ${copied ? "!border-[var(--accent)] !text-[var(--accent)]" : ""}`} aria-label="Copiar enlace">
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></svg>
        )}
      </button>
    </div>
  );
}
