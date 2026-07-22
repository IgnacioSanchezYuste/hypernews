"use client";

import { useEffect, useState } from "react";

type Item = { id: string; text: string; level: 2 | 3 };

/** Sticky TOC with scroll-spy. Highlights the section currently in view. */
export function TableOfContents({ items }: { items: Item[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => !!el);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-90px 0px -70% 0px", threshold: 0 }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="Índice del artículo" className="text-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-subtle">En este artículo</p>
      <ul className="space-y-1 border-l border-hair">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block border-l-2 py-1 transition-colors ${item.level === 3 ? "pl-6" : "pl-4"} ${
                active === item.id
                  ? "border-[var(--accent)] font-medium text-fg"
                  : "border-transparent text-muted hover:text-fg"
              }`}
              style={{ marginLeft: "-1px" }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
