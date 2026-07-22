"use client";

import { useEffect, useState } from "react";

/** Slim top progress bar tracking scroll through the article. */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = document.documentElement;
        const total = el.scrollHeight - el.clientHeight;
        setProgress(total > 0 ? (el.scrollTop / total) * 100 : 0);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-1" aria-hidden>
      <div
        className="h-full origin-left bg-[var(--accent)] transition-transform duration-75"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}
