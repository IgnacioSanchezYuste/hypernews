import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticle, getAllSlugs, getRelated, getByAuthor } from "@/lib/queries";
import { getCategory } from "@/lib/categories";
import { getAuthor } from "@/lib/authors";
import { buildMetadata, articleJsonLd, breadcrumbJsonLd, faqJsonLd, ogImage } from "@/lib/seo";
import { readingMinutes, tableOfContents, formatDate, formatViews } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { CoverImage } from "@/components/ui/CoverImage";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { Avatar } from "@/components/ui/Avatar";
import { ArticleBody } from "@/components/article/ArticleBody";
import { ReadingProgress } from "@/components/article/ReadingProgress";
import { TableOfContents } from "@/components/article/TableOfContents";
import { ShareButtons } from "@/components/article/ShareButtons";
import { Comments } from "@/components/article/Comments";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Newsletter } from "@/components/marketing/Newsletter";
import { AdSlot } from "@/components/monetization/AdSlot";

export const revalidate = 300; // ISR: refresh at most every 5 minutes

export function generateStaticParams() {
  // Pre-render the featured/most valuable articles; the rest render on-demand.
  return getAllSlugs().slice(0, 40).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Artículo no encontrado" };
  const category = getCategory(article.category);
  const author = getAuthor(article.author);
  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/articulo/${article.slug}`,
    type: "article",
    image: ogImage(article.title, category?.name),
    publishedTime: article.publishedAt,
    authors: author ? [author.name] : undefined,
    keywords: article.tags,
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const category = getCategory(article.category);
  const author = getAuthor(article.author);
  const minutes = readingMinutes(article.blocks);
  const toc = tableOfContents(article.blocks);
  const related = getRelated(article, 3);
  const byAuthor = getByAuthor(article.author, 4).filter((a) => a.slug !== article.slug).slice(0, 3);
  const path = `/articulo/${article.slug}`;
  const faqBlock = article.blocks.find((b) => b.type === "faq");

  const breadcrumb = [
    { name: "Inicio", path: "/" },
    ...(category ? [{ name: category.name, path: `/categoria/${category.slug}` }] : []),
    { name: article.title, path },
  ];

  return (
    <>
      <ReadingProgress />
      <JsonLd data={articleJsonLd(article)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumb.map((b) => ({ name: b.name, path: b.path })))} />
      {faqBlock && faqBlock.type === "faq" && <JsonLd data={faqJsonLd(faqBlock.items)} />}

      <article>
        {/* ── Header ─────────────────────────────────────────── */}
        <header className="container-page max-w-4xl pt-8 md:pt-12">
          <Breadcrumbs items={breadcrumb.map((b, i) => (i === breadcrumb.length - 1 ? { name: b.name } : b))} />
          <div className="mt-6">
            <CategoryBadge slug={article.category} size="md" />
          </div>
          <h1 className="mt-4 font-serif text-3xl font-medium leading-[1.1] md:text-5xl">{article.title}</h1>
          <p className="mt-5 text-lg text-muted md:text-xl">{article.excerpt}</p>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-y border-hair py-4">
            <div className="flex items-center gap-3">
              <Avatar author={article.author} size={44} />
              <div className="text-sm">
                {author && <Link href={`/autor/${author.slug}`} className="font-semibold link-underline">{author.name}</Link>}
                <p className="text-muted">
                  <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                  {" · "}{minutes} min de lectura{" · "}{formatViews(article.views)} lecturas
                </p>
              </div>
            </div>
            <ShareButtons title={article.title} path={path} />
          </div>
        </header>

        {/* ── Cover ──────────────────────────────────────────── */}
        <figure className="container-page mt-8 max-w-5xl">
          <CoverImage image={article.image} seed={article.coverSeed} category={article.category} className="aspect-[21/9] w-full" rounded="rounded-2xl" sizes="(max-width: 1024px) 100vw, 1024px" priority />
          {article.image?.credit && (
            <figcaption className="mt-2 text-right text-xs text-subtle">Foto: {article.image.credit}</figcaption>
          )}
        </figure>

        {/* ── Body + rails ───────────────────────────────────── */}
        <div className="container-page mt-12 grid max-w-6xl gap-10 lg:grid-cols-[1fr_minmax(0,44rem)_1fr]">
          {/* Left rail: sticky share */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <ShareButtons title={article.title} path={path} orientation="vertical" />
            </div>
          </div>

          {/* Content */}
          <div className="min-w-0">
            <ArticleBody blocks={article.blocks} category={article.category} />

            {/* Tags */}
            <div className="mt-10 flex flex-wrap gap-2">
              {article.tags.map((t) => (
                <Link key={t} href={`/etiqueta/${t}`} className="rounded-full border border-hair px-3 py-1 text-sm text-muted transition-colors hover:border-strong hover:text-fg">
                  #{t}
                </Link>
              ))}
            </div>

            {/* End CTA */}
            <div className="mt-10">
              <Newsletter variant="inline" />
            </div>

            {/* Author bio */}
            {author && (
              <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-hair bg-subtle p-6 sm:flex-row sm:items-start">
                <Avatar author={author.slug} size={56} />
                <div>
                  <p className="text-xs uppercase tracking-widest text-subtle">Escrito por</p>
                  <Link href={`/autor/${author.slug}`} className="text-lg font-semibold link-underline">{author.name}</Link>
                  <p className="text-sm text-muted">{author.role}</p>
                  <p className="mt-2 text-sm text-muted">{author.bio}</p>
                </div>
              </div>
            )}

            {/* Same author */}
            {byAuthor.length > 0 && (
              <div className="mt-12">
                <h2 className="mb-5 font-serif text-2xl font-medium">Más de {author?.name}</h2>
                <div className="grid gap-6 sm:grid-cols-3">
                  {byAuthor.map((a) => <ArticleCard key={a.slug} article={a} variant="standard" />)}
                </div>
              </div>
            )}

            <Comments count={article.comments} />
          </div>

          {/* Right rail: TOC + ad */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <TableOfContents items={toc} />
              <AdSlot format="rectangle" />
            </div>
          </div>
        </div>
      </article>

      {/* ── Related ────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="container-page mt-20">
          <h2 className="mb-6 font-serif text-2xl font-medium md:text-3xl">Artículos relacionados</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((a) => <ArticleCard key={a.slug} article={a} variant="standard" />)}
          </div>
        </section>
      )}
    </>
  );
}
