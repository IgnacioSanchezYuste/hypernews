import type { Metadata } from "next";
import { getTrending, getMostRead, getMostCommented } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { ArticleCard } from "@/components/article/ArticleCard";
import { SectionHeader } from "@/components/home/SectionHeader";

export const metadata: Metadata = buildMetadata({
  title: "Tendencias",
  description: "Lo más leído, lo más comentado y lo que marca tendencia ahora mismo en HyperNews.",
  path: "/tendencias",
});

export default function TrendingPage() {
  const trending = getTrending(6);
  const mostRead = getMostRead(6);
  const mostCommented = getMostCommented(5);

  return (
    <div className="container-page py-12">
      <SectionHeader eyebrow="Ahora mismo" title="Tendencias" description="El pulso en tiempo real de lo que leen y comentan miles de personas." />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {trending.map((a) => <ArticleCard key={a.slug} article={a} variant="standard" />)}
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 font-serif text-2xl font-medium">🔥 Lo más leído</h2>
          <div className="divide-y divide-[var(--border)]">
            {mostRead.map((a, i) => <ArticleCard key={a.slug} article={a} variant="list" index={i} />)}
          </div>
        </div>
        <div>
          <h2 className="mb-4 font-serif text-2xl font-medium">💬 Lo más comentado</h2>
          <div className="divide-y divide-[var(--border)]">
            {mostCommented.map((a, i) => <ArticleCard key={a.slug} article={a} variant="list" index={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
