import "server-only";
import { allArticles } from "./articles";
import { categories, getCategory, subcategoriesOf } from "./categories";
import type { Article } from "./types";
import { readingMinutes } from "./utils";

/**
 * Data-access layer. Every page imports from here — never from the raw seed.
 * Swapping the mock corpus for a CMS/DB means reimplementing this file only.
 */

const byDateDesc = (a: Article, b: Article) =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

/** Read time is derived, not stored — always consistent with content. */
export function withMeta(a: Article) {
  return { ...a, readingMinutes: readingMinutes(a.blocks) };
}

export function getAllArticles(): Article[] {
  return [...allArticles].sort(byDateDesc);
}

export function getArticle(slug: string): Article | undefined {
  return allArticles.find((a) => a.slug === slug);
}

export function getFeatured(limit = 5): Article[] {
  return allArticles.filter((a) => a.featured).sort(byDateDesc).slice(0, limit);
}

export function getLatest(limit = 12, excludeSlugs: string[] = []): Article[] {
  return getAllArticles()
    .filter((a) => !excludeSlugs.includes(a.slug))
    .slice(0, limit);
}

export function getTrending(limit = 6): Article[] {
  return allArticles.filter((a) => a.trending).sort((a, b) => b.views - a.views).slice(0, limit);
}

export function getMostRead(limit = 6): Article[] {
  return [...allArticles].sort((a, b) => b.views - a.views).slice(0, limit);
}

export function getMostCommented(limit = 5): Article[] {
  return [...allArticles].sort((a, b) => (b.comments ?? 0) - (a.comments ?? 0)).slice(0, limit);
}

/** Includes articles from child subcategories when a parent is requested. */
export function getByCategory(slug: string, limit?: number): Article[] {
  const childSlugs = subcategoriesOf(slug).map((c) => c.slug);
  const set = new Set([slug, ...childSlugs]);
  const result = allArticles.filter((a) => set.has(a.category)).sort(byDateDesc);
  return limit ? result.slice(0, limit) : result;
}

export function getByAuthor(slug: string, limit?: number): Article[] {
  const result = allArticles.filter((a) => a.author === slug).sort(byDateDesc);
  return limit ? result.slice(0, limit) : result;
}

export function getByTag(tag: string): Article[] {
  return allArticles.filter((a) => a.tags.includes(tag)).sort(byDateDesc);
}

/** Simple content-based recommender: same category + shared tags, ranked. */
export function getRelated(article: Article, limit = 3): Article[] {
  return allArticles
    .filter((a) => a.slug !== article.slug)
    .map((a) => {
      let score = 0;
      if (a.category === article.category) score += 3;
      score += a.tags.filter((t) => article.tags.includes(t)).length * 2;
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || byDateDesc(x.a, y.a))
    .slice(0, limit)
    .map((x) => x.a);
}

export function getRandom(limit = 4, excludeSlug?: string): Article[] {
  const pool = allArticles.filter((a) => a.slug !== excludeSlug);
  // Deterministic shuffle for stable SSG output
  const seeded = [...pool].sort((a, b) => (a.views % 7) - (b.views % 7));
  return seeded.slice(0, limit);
}

export function getRecommended(limit = 4): Article[] {
  return [...allArticles]
    .sort((a, b) => (b.views + (b.comments ?? 0) * 50) - (a.views + (a.comments ?? 0) * 50))
    .slice(3, 3 + limit);
}

/** Article counts per top-level category (for "popular categories"). */
export function categoryCounts() {
  return categories
    .filter((c) => c.primary)
    .map((c) => ({ category: c, count: getByCategory(c.slug).length }))
    .sort((a, b) => b.count - a.count);
}

export function getAllSlugs() {
  return allArticles.map((a) => a.slug);
}

export { getCategory };
