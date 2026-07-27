import { FEED_SOURCES, fetchCategoryFeed } from "./news-feed";
import { articleSlugExists, insertCuratedArticle, sourceUrlExists } from "./articles-db";
import { slugify } from "./utils";

export interface DailyUpdateResult {
  category: string;
  inserted: string[];
  skipped: number;
  error?: string;
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base);
  if (!slug) slug = "noticia";
  if (!(await articleSlugExists(slug))) return slug;

  for (let i = 2; i <= 20; i++) {
    const candidate = `${slug}-${i}`;
    if (!(await articleSlugExists(candidate))) return candidate;
  }
  return `${slug}-${Date.now()}`;
}

/**
 * Curates and stores the most relevant articles per category from external
 * feeds. `maxAgeDays` bounds how old a story may be — 2 days for the daily
 * top-up, 30 for a full backfill — `fetchCategoryFeed` only reaches past that
 * window if freshness alone can't fill the quota, so a quiet vertical is never
 * left empty.
 */
export async function runDailyNewsUpdate(itemsPerCategory = 10, maxAgeDays = 2): Promise<DailyUpdateResult[]> {
  const results: DailyUpdateResult[] = [];

  for (const source of FEED_SOURCES) {
    const result: DailyUpdateResult = { category: source.category, inserted: [], skipped: 0 };
    try {
      const items = await fetchCategoryFeed(source.category, itemsPerCategory, maxAgeDays);

      for (const item of items.slice(0, itemsPerCategory)) {
        if (await sourceUrlExists(item.sourceUrl)) {
          result.skipped++;
          continue;
        }
        const slug = await uniqueSlug(item.title);
        await insertCuratedArticle({
          slug,
          title: item.title,
          excerpt: item.excerpt,
          imageUrl: item.image.url,
          imageAlt: item.image.alt,
          imageCredit: item.image.credit,
          category: source.category,
          tags: item.tags,
          author: "equipo-hypernews",
          blocks: item.blocks,
          featured: false,
          trending: false,
          publishedAt: item.publishedAt,
          sourceUrl: item.sourceUrl,
          sourceName: item.sourceName,
        });
        result.inserted.push(slug);
      }
    } catch (err) {
      result.error = err instanceof Error ? err.message : String(err);
    }
    results.push(result);
  }

  return results;
}
