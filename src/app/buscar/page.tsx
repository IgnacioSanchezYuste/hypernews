import type { Metadata } from "next";
import Link from "next/link";
import { allArticles } from "@/lib/articles";
import { categories } from "@/lib/categories";
import { authors } from "@/lib/authors";
import { buildMetadata } from "@/lib/seo";
import { ArticleCard } from "@/components/article/ArticleCard";
import { SearchBox } from "@/components/layout/SearchBox";

export const metadata: Metadata = buildMetadata({
  title: "Buscar",
  description: "Busca en todo HyperNews: artículos, categorías, autores y recursos.",
  path: "/buscar",
});

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = norm(q).trim();

  const foundArticles = query
    ? allArticles.filter((a) => norm(a.title).includes(query) || norm(a.excerpt).includes(query) || a.tags.some((t) => norm(t).includes(query)))
    : [];
  const foundCategories = query ? categories.filter((c) => norm(c.name).includes(query) || norm(c.description).includes(query)) : [];
  const foundAuthors = query ? authors.filter((a) => norm(a.name).includes(query)) : [];

  const total = foundArticles.length + foundCategories.length + foundAuthors.length;

  return (
    <div className="container-page py-12">
      <h1 className="font-serif text-3xl font-medium md:text-4xl">Buscar en HyperNews</h1>
      <div className="mt-6 max-w-2xl">
        <SearchBox initial={q} />
      </div>

      {query && (
        <p className="mt-6 text-muted">
          {total} resultado{total !== 1 ? "s" : ""} para <span className="font-semibold text-fg">“{q}”</span>
        </p>
      )}

      {!query && (
        <p className="mt-8 text-muted">Escribe algo para empezar. También puedes pulsar <kbd className="rounded border border-hair px-1.5 py-0.5 text-xs">⌘K</kbd> en cualquier página.</p>
      )}

      {query && total === 0 && (
        <div className="mt-10 rounded-2xl border border-hair bg-subtle p-10 text-center">
          <p className="text-lg font-medium">Sin resultados para “{q}”</p>
          <p className="mt-1 text-muted">Prueba con otros términos o explora las categorías.</p>
        </div>
      )}

      {foundCategories.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-subtle">Categorías</h2>
          <div className="flex flex-wrap gap-2">
            {foundCategories.map((c) => (
              <Link key={c.slug} href={`/categoria/${c.slug}`} className="rounded-full border border-hair px-3.5 py-1.5 text-sm font-medium" style={{ color: c.color }}>
                {c.glyph} {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {foundAuthors.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-subtle">Autores</h2>
          <div className="flex flex-wrap gap-3">
            {foundAuthors.map((a) => (
              <Link key={a.slug} href={`/autor/${a.slug}`} className="rounded-xl border border-hair px-4 py-2 text-sm font-medium hover:border-strong">{a.name}</Link>
            ))}
          </div>
        </section>
      )}

      {foundArticles.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-subtle">Artículos</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {foundArticles.slice(0, 12).map((a) => <ArticleCard key={a.slug} article={a} variant="standard" />)}
          </div>
        </section>
      )}
    </div>
  );
}
