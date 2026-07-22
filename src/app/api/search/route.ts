import { NextResponse } from "next/server";
import { allArticles } from "@/lib/articles";
import { categories } from "@/lib/categories";
import { authors } from "@/lib/authors";

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Instant multi-entity search across articles, categories, authors, resources. */
export function GET(req: Request) {
  const q = norm(new URL(req.url).searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ results: [] });

  const results: unknown[] = [];

  for (const c of categories) {
    if (norm(c.name).includes(q) || norm(c.description).includes(q)) {
      results.push({ type: "category", title: c.name, subtitle: c.description, href: `/categoria/${c.slug}`, glyph: c.glyph });
    }
  }
  for (const a of authors) {
    if (norm(a.name).includes(q) || norm(a.role).includes(q)) {
      results.push({ type: "author", title: a.name, subtitle: a.role, href: `/autor/${a.slug}`, glyph: "◍" });
    }
  }
  for (const a of allArticles) {
    if (norm(a.title).includes(q) || norm(a.excerpt).includes(q) || a.tags.some((t) => norm(t).includes(q))) {
      results.push({ type: "article", title: a.title, subtitle: a.excerpt, href: `/articulo/${a.slug}`, glyph: "▤" });
    }
    if (results.length > 24) break;
  }

  return NextResponse.json({ results: results.slice(0, 12) });
}
