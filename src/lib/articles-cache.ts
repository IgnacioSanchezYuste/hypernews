import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { fetchAllArticles } from "./articles-db";
import type { Article } from "./types";

/** Invalidation tag for everything derived from the articles table. */
export const ARTICLES_TAG = "articles";

/** How long a catalogue snapshot may be served before it is refreshed. */
export const ARTICLES_TTL_SECONDS = 300;

const cachedCatalogue = unstable_cache(fetchAllArticles, ["articles:catalogue"], {
  tags: [ARTICLES_TAG],
  revalidate: ARTICLES_TTL_SECONDS,
});

/**
 * The catalogue, cached twice over: `unstable_cache` keeps Postgres out of the
 * hot path across requests, `cache` de-duplicates the dozen helpers in
 * queries.ts that read it while rendering a single page. Writes call
 * `revalidateTag(ARTICLES_TAG)` so editors still see their changes instantly.
 */
export const getAllArticlesFromDb = cache(async (): Promise<Article[]> => cachedCatalogue());
