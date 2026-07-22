import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { authors, getAuthor } from "@/lib/authors";
import { getByAuthor } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { Avatar } from "@/components/ui/Avatar";
import { InfiniteArticles } from "@/components/article/InfiniteArticles";

export function generateStaticParams() {
  return authors.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) return { title: "Autor no encontrado" };
  return buildMetadata({
    title: `${author.name} — ${author.role}`,
    description: author.bio,
    path: `/autor/${author.slug}`,
  });
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) notFound();
  const articles = getByAuthor(slug);

  return (
    <div className="container-page py-12">
      <div className="flex flex-col items-center gap-4 border-b border-hair pb-10 text-center">
        <Avatar author={author.slug} size={88} />
        <div>
          <h1 className="font-serif text-3xl font-medium md:text-4xl">{author.name}</h1>
          <p className="mt-1 text-[var(--accent)]">{author.role}</p>
        </div>
        <p className="max-w-2xl text-muted">{author.bio}</p>
        <div className="flex gap-3 text-sm text-muted">
          {author.twitter && <a href={`https://x.com/${author.twitter}`} className="hover:text-fg" target="_blank" rel="noopener noreferrer">@{author.twitter}</a>}
          <span>· {articles.length} artículos publicados</span>
        </div>
      </div>

      <div className="mt-10">
        <InfiniteArticles articles={articles} pageSize={9} />
      </div>
    </div>
  );
}
