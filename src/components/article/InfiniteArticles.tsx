"use client";

import { useEffect, useRef, useState } from "react";
import type { Article } from "@/lib/types";
import { ArticleCard } from "./ArticleCard";

/**
 * Progressive-reveal grid. Renders the first `pageSize` server-side (great for
 * SEO + LCP) and reveals more on scroll — infinite scroll without over-fetching.
 */
export function InfiniteArticles({
  articles,
  pageSize = 9,
  variant = "standard",
}: {
  articles: Article[];
  pageSize?: number;
  variant?: "standard" | "feature";
}) {
  const [count, setCount] = useState(pageSize);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (count >= articles.length) return;
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCount((c) => Math.min(c + pageSize, articles.length));
        }
      },
      { rootMargin: "600px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [count, articles.length, pageSize]);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.slice(0, count).map((a) => (
          <ArticleCard key={a.slug} article={a} variant={variant} />
        ))}
      </div>

      {count < articles.length && (
        <div ref={sentinel} className="mt-10 flex justify-center">
          <button
            onClick={() => setCount((c) => Math.min(c + pageSize, articles.length))}
            className="rounded-full border border-hair px-6 py-3 text-sm font-medium text-muted transition-colors hover:border-strong hover:text-fg"
          >
            Cargar más artículos
          </button>
        </div>
      )}
    </>
  );
}
