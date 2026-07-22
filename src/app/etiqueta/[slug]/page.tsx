import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getByTag } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { InfiniteArticles } from "@/components/article/InfiniteArticles";
import { SectionHeader } from "@/components/home/SectionHeader";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return buildMetadata({
    title: `#${slug} — Artículos etiquetados`,
    description: `Todos los artículos de HyperNews etiquetados con «${slug}».`,
    path: `/etiqueta/${slug}`,
  });
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const articles = getByTag(slug);
  if (articles.length === 0) notFound();

  return (
    <div className="container-page py-12">
      <SectionHeader eyebrow="Etiqueta" title={`#${slug}`} description={`${articles.length} artículos relacionados.`} />
      <InfiniteArticles articles={articles} pageSize={9} />
    </div>
  );
}
