import "server-only";
import { getAllArticlesFromDb } from "./articles-cache";
import { categories, getCategory, subcategoriesOf } from "./categories";
import type { Article } from "./types";
import { readingMinutes } from "./utils";

/**
 * Data-access layer. Every page imports from here — never from the DB layer directly.
 * Backed by Postgres via articles-db.ts.
 */

const byDateDesc = (a: Article, b: Article) =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

/** Read time is derived, not stored — always consistent with content. */
export function withMeta(a: Article) {
  return { ...a, readingMinutes: readingMinutes(a.blocks) };
}

export async function getAllArticles(): Promise<Article[]> {
  const all = await getAllArticlesFromDb();
  return [...all].sort(byDateDesc);
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  const all = await getAllArticlesFromDb();
  return all.find((a) => a.slug === slug);
}

export async function getFeatured(limit = 5): Promise<Article[]> {
  const all = await getAllArticlesFromDb();
  return all.filter((a) => a.featured).sort(byDateDesc).slice(0, limit);
}

export async function getLatest(limit = 12, excludeSlugs: string[] = []): Promise<Article[]> {
  const all = await getAllArticles();
  return all.filter((a) => !excludeSlugs.includes(a.slug)).slice(0, limit);
}

export async function getTrending(limit = 6): Promise<Article[]> {
  const all = await getAllArticlesFromDb();
  return all.filter((a) => a.trending).sort((a, b) => b.views - a.views).slice(0, limit);
}

export async function getMostRead(limit = 6): Promise<Article[]> {
  const all = await getAllArticlesFromDb();
  return [...all].sort((a, b) => b.views - a.views).slice(0, limit);
}

export async function getMostCommented(limit = 5): Promise<Article[]> {
  const all = await getAllArticlesFromDb();
  return [...all].sort((a, b) => (b.comments ?? 0) - (a.comments ?? 0)).slice(0, limit);
}

/** Includes articles from child subcategories when a parent is requested. */
export async function getByCategory(slug: string, limit?: number): Promise<Article[]> {
  const all = await getAllArticlesFromDb();
  const childSlugs = subcategoriesOf(slug).map((c) => c.slug);
  const set = new Set([slug, ...childSlugs]);
  const result = all.filter((a) => set.has(a.category)).sort(byDateDesc);
  return limit ? result.slice(0, limit) : result;
}

export async function getByAuthor(slug: string, limit?: number): Promise<Article[]> {
  const all = await getAllArticlesFromDb();
  const result = all.filter((a) => a.author === slug).sort(byDateDesc);
  return limit ? result.slice(0, limit) : result;
}

export async function getByTag(tag: string): Promise<Article[]> {
  const all = await getAllArticlesFromDb();
  return all.filter((a) => a.tags.includes(tag)).sort(byDateDesc);
}

/** Simple content-based recommender: same category + shared tags, ranked. */
export async function getRelated(article: Article, limit = 3): Promise<Article[]> {
  const all = await getAllArticlesFromDb();
  return all
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

export async function getRandom(limit = 4, excludeSlug?: string): Promise<Article[]> {
  const all = await getAllArticlesFromDb();
  const pool = all.filter((a) => a.slug !== excludeSlug);
  // Deterministic shuffle for stable SSG output
  const seeded = [...pool].sort((a, b) => (a.views % 7) - (b.views % 7));
  return seeded.slice(0, limit);
}

export async function getRecommended(limit = 4): Promise<Article[]> {
  const all = await getAllArticlesFromDb();
  return [...all]
    .sort((a, b) => (b.views + (b.comments ?? 0) * 50) - (a.views + (a.comments ?? 0) * 50))
    .slice(3, 3 + limit);
}

/** Article counts per top-level category (for "popular categories"). */
export async function categoryCounts() {
  const result = [];
  for (const c of categories.filter((c) => c.primary)) {
    const count = (await getByCategory(c.slug)).length;
    result.push({ category: c, count });
  }
  return result.sort((a, b) => b.count - a.count);
}

export async function getAllSlugs() {
  const all = await getAllArticlesFromDb();
  return all.map((a) => a.slug);
}

export { getCategory };
