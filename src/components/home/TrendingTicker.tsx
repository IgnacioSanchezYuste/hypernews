import Link from "next/link";
import type { Article } from "@/lib/types";

/** Horizontal, scrollable strip of trending headlines with a live pulse dot. */
export function TrendingTicker({ articles }: { articles: Article[] }) {
  return (
    <div className="border-y border-hair bg-subtle">
      <div className="container-page flex items-center gap-4 py-2.5">
        <span className="flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
          </span>
          En tendencia
        </span>
        <div className="no-scrollbar flex gap-6 overflow-x-auto whitespace-nowrap text-sm">
          {articles.map((a) => (
            <Link key={a.slug} href={`/articulo/${a.slug}`} className="text-muted transition-colors hover:text-fg">
              {a.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
