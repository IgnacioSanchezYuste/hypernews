import Link from "next/link";
import { ArticleCard } from "@/components/article/ArticleCard";
import { SectionHeader } from "@/components/home/SectionHeader";
import { TrendingTicker } from "@/components/home/TrendingTicker";
import { Newsletter } from "@/components/marketing/Newsletter";
import {
  getFeatured, getLatest, getTrending, getMostRead, getByCategory, getRecommended,
} from "@/lib/queries";
import { primaryCategories } from "@/lib/categories";
import type { Article } from "@/lib/types";
import { CoverImage } from "@/components/ui/CoverImage";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { ArticleMeta } from "@/components/article/ArticleMeta";
import { readingMinutes } from "@/lib/utils";

// ISR: served from the edge cache and refreshed at most every 5 minutes.
export const revalidate = 300;

export default async function HomePage() {
  const featured = await getFeatured(3);
  const [hero, ...sideFeatured] = featured;
  const latest = await getLatest(5, featured.map((a) => a.slug));
  const trending = await getTrending(8);
  const mostRead = await getMostRead(5);
  const recommended = await getRecommended(4);
  const categorySections = await Promise.all(
    primaryCategories.map(async (category) => ({
      category,
      articles: await getByCategory(category.slug, 4),
    }))
  );

  return (
    <>
      {/* ── FEATURED ─────────────────────────────────────────── */}
      <section className="container-page pt-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">{hero && <ArticleCard article={hero} variant="hero" />}</div>
          <div className="flex flex-col gap-6">
            {sideFeatured.slice(0, 2).map((a) => (
              <div key={a.slug} className="flex-1"><ArticleCard article={a} variant="feature" /></div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-8"><TrendingTicker articles={trending} /></div>

      {/* ── LATEST + SIDEBAR ─────────────────────────────────── */}
      <section className="container-page mt-12 md:mt-16">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main column */}
          <div className="lg:col-span-2">
            <SectionHeader eyebrow="Lo último" title="Artículos recientes" href="/articulos" />
            <div className="divide-y divide-[var(--border)]">
              {latest.map((a) => (
                <div key={a.slug} className="group grid gap-4 py-6 first:pt-0 sm:grid-cols-[1fr_1.4fr]">
                  <Link href={`/articulo/${a.slug}`} className="block overflow-hidden rounded-xl" tabIndex={-1} aria-hidden>
                    <div className="aspect-[16/10] transition-transform duration-700 group-hover:scale-[1.03]">
                      <ArticleThumb article={a} />
                    </div>
                  </Link>
                  <ArticleRowBody article={a} />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-10">
            <div>
              <SectionHeader eyebrow="Ranking" title="Lo más leído" />
              <div className="divide-y divide-[var(--border)] rounded-2xl border border-hair p-5">
                {mostRead.map((a, i) => <ArticleCard key={a.slug} article={a} variant="list" index={i} />)}
              </div>
            </div>
            <Newsletter variant="inline" />
          </aside>
        </div>
      </section>

      {/* ── CATEGORY SECTIONS ────────────────────────────────── */}
      {categorySections.map(({ category, articles }) => {
        return (
          <section key={category.slug} className="container-page mt-16 md:mt-20">
            <div className="mb-6 flex items-end justify-between border-b-2 pb-3" style={{ borderColor: category.color }}>
              <h2 className="font-serif text-2xl font-semibold md:text-3xl">
                <Link href={`/categoria/${category.slug}`} className="hover:opacity-80" style={{ color: category.color }}>{category.name}</Link>
              </h2>
              <Link href={`/categoria/${category.slug}`} className="text-sm font-medium text-muted hover:text-fg">Ver todos →</Link>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {articles.map((a) => <ArticleCard key={a.slug} article={a} variant="standard" />)}
            </div>
          </section>
        );
      })}

      {/* ── RECOMMENDED ──────────────────────────────────────── */}
      <section className="container-page mt-16 md:mt-20">
        <SectionHeader eyebrow="Para ti" title="También te puede interesar" href="/articulos" />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {recommended.map((a) => <ArticleCard key={a.slug} article={a} variant="standard" />)}
        </div>
      </section>

      <Newsletter />
    </>
  );
}

/* Small helpers for the editorial "row" layout in the main column */
function ArticleThumb({ article }: { article: Article }) {
  return <CoverImage image={article.image} seed={article.coverSeed} category={article.category} className="h-full w-full" rounded="rounded-xl" sizes="(max-width: 640px) 100vw, 300px" />;
}

function ArticleRowBody({ article }: { article: Article }) {
  return (
    <div className="flex flex-col justify-center">
      <CategoryBadge slug={article.category} />
      <h3 className="mt-2 font-serif text-xl font-semibold leading-tight md:text-2xl">
        <Link href={`/articulo/${article.slug}`} className="hover:text-brand-600">{article.title}</Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-muted">{article.excerpt}</p>
      <div className="mt-3"><ArticleMeta author={article.author} date={article.publishedAt} readingMinutes={readingMinutes(article.blocks)} /></div>
    </div>
  );
}
