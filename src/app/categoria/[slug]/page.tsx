import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getByCategory } from "@/lib/queries";
import { categories, getCategory, subcategoriesOf } from "@/lib/categories";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArticleCard } from "@/components/article/ArticleCard";
import { InfiniteArticles } from "@/components/article/InfiniteArticles";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AdSlot } from "@/components/monetization/AdSlot";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) return { title: "Categoría no encontrada" };
  return buildMetadata({
    title: `${cat.name} — Artículos, noticias y guías`,
    description: cat.description,
    path: `/categoria/${cat.slug}`,
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) notFound();

  const articles = getByCategory(slug);
  if (articles.length === 0) notFound();

  const [lead, ...rest] = articles;
  const subs = subcategoriesOf(slug);
  const parent = cat.parent ? getCategory(cat.parent) : undefined;

  const breadcrumb = [
    { name: "Inicio", path: "/" },
    ...(parent ? [{ name: parent.name, path: `/categoria/${parent.slug}` }] : []),
    { name: cat.name },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(breadcrumb.map((b) => ({ name: b.name, path: b.path ?? `/categoria/${cat.slug}` })))} />

      {/* Section header — clean editorial band with a color rule */}
      <section className="border-b border-hair bg-subtle">
        <div className="container-page py-10 md:py-14">
          <Breadcrumbs items={breadcrumb} />
          <div className="mt-5 border-l-4 pl-4" style={{ borderColor: cat.color }}>
            <h1 className="font-serif text-3xl font-semibold md:text-5xl" style={{ color: cat.color }}>{cat.name}</h1>
            <p className="mt-3 max-w-2xl text-lg text-muted">{cat.description}</p>
            <p className="mt-2 text-sm text-subtle">{articles.length} artículos publicados</p>
          </div>

          {subs.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {subs.map((s) => (
                <Link key={s.slug} href={`/categoria/${s.slug}`} className="rounded-full border border-hair bg-surface px-3.5 py-1.5 text-sm font-medium text-muted transition-colors hover:border-strong hover:text-fg">
                  {s.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lead + list */}
      <section className="container-page mt-12">
        {lead && (
          <div className="mb-10">
            <ArticleCard article={lead} variant="feature" />
          </div>
        )}
        <InfiniteArticles articles={rest} pageSize={9} />
      </section>

      <div className="container-page mt-16">
        <AdSlot format="leaderboard" />
      </div>
    </>
  );
}
