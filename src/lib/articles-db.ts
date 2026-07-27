import { pool } from "./db";
import type { Article, Block } from "./types";

interface ArticleRow {
  slug: string;
  title: string;
  excerpt: string;
  image_url: string;
  image_alt: string;
  image_credit: string | null;
  cover_seed: string;
  category: string;
  tags: string[];
  author: string;
  published_at: Date;
  updated_at: Date | null;
  blocks: Block[];
  featured: boolean;
  trending: boolean;
  series: string | null;
  views: number;
  comments: number;
  source_url: string | null;
  source_name: string | null;
}

function toArticle(row: ArticleRow): Article {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    image: { url: row.image_url, alt: row.image_alt, credit: row.image_credit ?? undefined },
    coverSeed: row.cover_seed,
    category: row.category,
    tags: row.tags,
    author: row.author,
    publishedAt: row.published_at.toISOString(),
    updatedAt: row.updated_at ? row.updated_at.toISOString() : undefined,
    blocks: row.blocks,
    featured: row.featured,
    trending: row.trending,
    series: row.series ?? undefined,
    views: row.views,
    comments: row.comments,
    source: row.source_url && row.source_name ? { name: row.source_name, url: row.source_url } : undefined,
  };
}

const COLUMNS = `slug, title, excerpt, image_url, image_alt, image_credit, cover_seed, category, tags,
  author, published_at, updated_at, blocks, featured, trending, series, views, comments,
  source_url, source_name`;

/**
 * Single read of the whole catalogue. Callers in the app never hit this
 * directly — `articles-cache.ts` puts it behind the data cache so one query
 * serves every request in the revalidation window.
 */
export async function fetchAllArticles(): Promise<Article[]> {
  const { rows } = await pool.query<ArticleRow>(
    `select ${COLUMNS} from articles order by published_at desc`
  );
  return rows.map(toArticle);
}

export interface NewArticleInput {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  imageAlt: string;
  imageCredit?: string;
  category: string;
  tags: string[];
  author: string;
  blocks: Block[];
  featured: boolean;
  trending: boolean;
}

export async function insertArticle(input: NewArticleInput): Promise<void> {
  await pool.query(
    `insert into articles
      (slug, title, excerpt, image_url, image_alt, image_credit, cover_seed, category, tags, author,
       published_at, blocks, featured, trending, views, comments)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now(), $11, $12, $13, 0, 0)`,
    [
      input.slug,
      input.title,
      input.excerpt,
      input.imageUrl,
      input.imageAlt,
      input.imageCredit ?? null,
      input.slug,
      input.category,
      input.tags,
      input.author,
      JSON.stringify(input.blocks),
      input.featured,
      input.trending,
    ]
  );
}

/** Real per-visit counter, driven by a client-side beacon (see ViewTracker). */
export async function incrementArticleViews(slug: string): Promise<void> {
  await pool.query("update articles set views = views + 1 where slug = $1", [slug]);
}

export async function articleSlugExists(slug: string): Promise<boolean> {
  const { rows } = await pool.query("select 1 from articles where slug = $1", [slug]);
  return rows.length > 0;
}

export async function deleteArticle(slug: string): Promise<void> {
  await pool.query("delete from articles where slug = $1", [slug]);
}

export interface CuratedArticleInput extends NewArticleInput {
  publishedAt: string;
  sourceUrl: string;
  sourceName: string;
}

export async function sourceUrlExists(sourceUrl: string): Promise<boolean> {
  const { rows } = await pool.query("select 1 from articles where source_url = $1", [sourceUrl]);
  return rows.length > 0;
}

/** Insert an article auto-curated from an external feed, crediting the original source. */
export async function insertCuratedArticle(input: CuratedArticleInput): Promise<void> {
  await pool.query(
    `insert into articles
      (slug, title, excerpt, image_url, image_alt, image_credit, cover_seed, category, tags, author,
       published_at, blocks, featured, trending, views, comments, source_url, source_name)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, $11, $12, $13, $14, 0, 0, $15, $16)
     on conflict (source_url) do nothing`,
    [
      input.slug,
      input.title,
      input.excerpt,
      input.imageUrl,
      input.imageAlt,
      input.imageCredit ?? null,
      input.slug,
      input.category,
      input.tags,
      input.author,
      input.publishedAt,
      JSON.stringify(input.blocks),
      input.featured,
      input.trending,
      input.sourceUrl,
      input.sourceName,
    ]
  );
}
