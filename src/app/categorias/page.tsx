import type { Metadata } from "next";
import Link from "next/link";
import { primaryCategories } from "@/lib/categories";
import { getByCategory } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { ArticleCard } from "@/components/article/ArticleCard";
import { SectionHeader } from "@/components/home/SectionHeader";

export const metadata: Metadata = buildMetadata({
  title: "Temas",
  description: "Explora los temas de HyperNews: Inteligencia Artificial, Psicología e Historia & Negocios.",
  path: "/categorias",
});

export default function CategoriesPage() {
  return (
    <div className="container-page py-12">
      <SectionHeader eyebrow="Explora" title="Nuestros temas" description="Tres verticales, un mismo criterio: explicar bien lo que merece la pena." />

      <div className="space-y-16">
        {primaryCategories.map((category) => {
          const articles = getByCategory(category.slug, 3);
          return (
            <section key={category.slug}>
              <div className="mb-6 border-l-4 pl-4" style={{ borderColor: category.color }}>
                <h2 className="font-serif text-2xl font-semibold md:text-3xl" style={{ color: category.color }}>
                  <Link href={`/categoria/${category.slug}`} className="hover:opacity-80">{category.name}</Link>
                </h2>
                <p className="mt-2 max-w-2xl text-muted">{category.description}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {articles.map((a) => <ArticleCard key={a.slug} article={a} variant="standard" />)}
              </div>
              <div className="mt-5">
                <Link href={`/categoria/${category.slug}`} className="text-sm font-semibold" style={{ color: category.color }}>
                  Ver todos los artículos de {category.name} →
                </Link>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
