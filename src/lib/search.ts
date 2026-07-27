import "server-only";
import { getAllArticles } from "./queries";
import { categories } from "./categories";
import { authors } from "./authors";
import type { Article, Author, Category } from "./types";

/** Long queries cost more to scan and never come from a human. */
export const MAX_QUERY_LENGTH = 80;

/** Lowercase, accent-insensitive and length-capped. */
export function normalizeQuery(raw: string): string {
  return raw
    .slice(0, MAX_QUERY_LENGTH)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export interface SearchHit {
  type: "article" | "category" | "author";
  title: string;
  subtitle: string;
  href: string;
  glyph: string;
}

export interface SearchResults {
  articles: Article[];
  categories: Category[];
  authors: Author[];
  total: number;
}

/** Site-wide search over the live catalogue, categories and authors. */
export async function search(rawQuery: string, articleLimit = 24): Promise<SearchResults> {
  const q = normalizeQuery(rawQuery);
  if (!q) return { articles: [], categories: [], authors: [], total: 0 };

  const matchedCategories = categories.filter(
    (c) => normalizeQuery(c.name).includes(q) || normalizeQuery(c.description).includes(q)
  );
  const matchedAuthors = authors.filter(
    (a) => normalizeQuery(a.name).includes(q) || normalizeQuery(a.role).includes(q)
  );

  const all = await getAllArticles();
  const matchedArticles = all
    .filter(
      (a) =>
        normalizeQuery(a.title).includes(q) ||
        normalizeQuery(a.excerpt).includes(q) ||
        a.tags.some((t) => normalizeQuery(t).includes(q))
    )
    // Title matches are what people are looking for; excerpt matches are noise by comparison.
    .sort((a, b) => Number(normalizeQuery(b.title).includes(q)) - Number(normalizeQuery(a.title).includes(q)))
    .slice(0, articleLimit);

  return {
    articles: matchedArticles,
    categories: matchedCategories,
    authors: matchedAuthors,
    total: matchedArticles.length + matchedCategories.length + matchedAuthors.length,
  };
}

/** Flat result list used by the ⌘K dialog. */
export async function searchHits(rawQuery: string, limit = 12): Promise<SearchHit[]> {
  const { articles, categories: cats, authors: people } = await search(rawQuery, limit);

  return [
    ...cats.map((c): SearchHit => ({
      type: "category",
      title: c.name,
      subtitle: c.description,
      href: `/categoria/${c.slug}`,
      glyph: c.glyph,
    })),
    ...people.map((a): SearchHit => ({
      type: "author",
      title: a.name,
      subtitle: a.role,
      href: `/autor/${a.slug}`,
      glyph: "◍",
    })),
    ...articles.map((a): SearchHit => ({
      type: "article",
      title: a.title,
      subtitle: a.excerpt,
      href: `/articulo/${a.slug}`,
      glyph: "▤",
    })),
  ].slice(0, limit);
}
