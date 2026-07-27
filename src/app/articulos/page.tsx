import type { Metadata } from "next";
import { getAllArticles } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { InfiniteArticles } from "@/components/article/InfiniteArticles";
import { SectionHeader } from "@/components/home/SectionHeader";

// ISR: served from the edge cache and refreshed at most every 5 minutes.
export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Todos los artículos",
  description: "El archivo completo de HyperNews. Todas las historias, noticias y guías en un solo lugar.",
  path: "/articulos",
});

export default async function AllArticlesPage() {
  const articles = await getAllArticles();
  return (
    <div className="container-page py-12">
      <SectionHeader eyebrow="Archivo" title="Todos los artículos" description={`${articles.length} historias y contando.`} />
      <InfiniteArticles articles={articles} pageSize={12} />
    </div>
  );
}
