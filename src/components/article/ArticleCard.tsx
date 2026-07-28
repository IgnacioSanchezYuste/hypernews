import Link from "next/link";
import type { Article } from "@/lib/types";
import { CoverImage } from "@/components/ui/CoverImage";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { ArticleMeta } from "./ArticleMeta";
import { readingMinutes } from "@/lib/utils";

type Variant = "hero" | "feature" | "standard" | "compact" | "list";

/** One card component, five layouts, so every surface stays consistent. */
export function ArticleCard({
  article,
  variant = "standard",
  index,
  fill = false,
}: {
  article: Article;
  variant?: Variant;
  index?: number;
  /** "feature" only: stretch to the height its flex/grid parent gives it, instead of a fixed aspect ratio. Used when a sibling (e.g. a taller hero card) must dictate the row height. */
  fill?: boolean;
}) {
  const href = `/articulo/${article.slug}`;
  const minutes = readingMinutes(article.blocks);

  if (variant === "list") {
    return (
      <article className="group flex items-start gap-3 py-3.5">
        {index != null && (
          <span className="w-6 shrink-0 font-serif text-xl text-brand-500 tabular-nums">{index + 1}</span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[0.95rem] font-semibold leading-snug">
            <Link href={href} className="hover:text-brand-600">{article.title}</Link>
          </h3>
          <p className="mt-1 text-xs text-subtle">{minutes} min · {article.views.toLocaleString("es-ES")} lecturas</p>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group flex gap-3.5">
        <Link href={href} className="shrink-0" tabIndex={-1} aria-hidden>
          <CoverImage image={article.image} seed={article.coverSeed} category={article.category} className="h-[68px] w-[92px]" rounded="rounded-lg" sizes="92px" />
        </Link>
        <div className="min-w-0">
          <CategoryBadge slug={article.category} />
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug">
            <Link href={href} className="hover:text-brand-600">{article.title}</Link>
          </h3>
        </div>
      </article>
    );
  }

  if (variant === "hero") {
    return (
      <article className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl p-6 text-white shadow-lift sm:aspect-[16/10] md:p-9">
        <CoverImage image={article.image} seed={article.coverSeed} category={article.category} rounded="" className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 66vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/5" />
        <div className="relative max-w-2xl">
          <CategoryBadge slug={article.category} asLink={false} onDark />
          <h2 className="mt-3 font-serif text-2xl font-semibold leading-[1.12] md:text-4xl">
            <Link href={href}>
              <span className="absolute inset-0" aria-hidden />
              {article.title}
            </Link>
          </h2>
          <p className="mt-3 line-clamp-2 max-w-xl text-sm text-white/85 md:text-base">{article.excerpt}</p>
          <div className="mt-4 [&_*]:!text-white/85 [&_a]:!text-white">
            <ArticleMeta author={article.author} date={article.publishedAt} readingMinutes={minutes} />
          </div>
        </div>
      </article>
    );
  }

  if (variant === "feature") {
    return (
      <article className={`group flex flex-col ${fill ? "lg:h-full" : ""}`}>
        <Link href={href} className={`block overflow-hidden rounded-xl ${fill ? "lg:flex-1 lg:min-h-0" : ""}`} tabIndex={-1} aria-hidden>
          <CoverImage image={article.image} seed={article.coverSeed} category={article.category} className={`aspect-[16/10] w-full transition-transform duration-700 group-hover:scale-[1.03] ${fill ? "lg:aspect-auto lg:h-full" : ""}`} sizes="(max-width: 768px) 100vw, 50vw" />
        </Link>
        <div className="flex flex-1 flex-col pt-4">
          <CategoryBadge slug={article.category} />
          <h3 className="mt-2 line-clamp-2 font-serif text-xl font-semibold leading-tight md:text-2xl">
            <Link href={href} className="hover:text-brand-600">{article.title}</Link>
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 text-muted">{article.excerpt}</p>
          <div className="mt-3"><ArticleMeta author={article.author} date={article.publishedAt} readingMinutes={minutes} /></div>
        </div>
      </article>
    );
  }

  // standard — classic blog card
  return (
    <article className="group flex flex-col">
      <Link href={href} className="block overflow-hidden rounded-xl" tabIndex={-1} aria-hidden>
        <CoverImage image={article.image} seed={article.coverSeed} category={article.category} className="aspect-[16/10] w-full transition-transform duration-700 group-hover:scale-[1.03]" sizes="(max-width: 768px) 100vw, 33vw" />
      </Link>
      <div className="flex flex-1 flex-col pt-3.5">
        <CategoryBadge slug={article.category} />
        <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug">
          <Link href={href} className="hover:text-brand-600">{article.title}</Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted">{article.excerpt}</p>
        <div className="mt-3"><ArticleMeta author={article.author} date={article.publishedAt} withAvatar={false} /></div>
      </div>
    </article>
  );
}
