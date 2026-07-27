import Link from "next/link";
import { getMostRead } from "@/lib/queries";
import { ArticleCard } from "@/components/article/ArticleCard";

/** Bots generate most 404s; a database hiccup must not turn them into 500s. */
async function suggestionsOrNone() {
  try {
    return await getMostRead(3);
  } catch {
    return [];
  }
}

export default async function NotFound() {
  const suggestions = await suggestionsOrNone();
  return (
    <div className="container-page py-20 text-center">
      <p className="font-serif text-7xl font-medium text-[var(--accent)] md:text-9xl">404</p>
      <h1 className="mt-4 font-serif text-2xl font-medium md:text-3xl">Esta página se perdió en el ciberespacio</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">La URL que buscas no existe o se ha movido. Pero hay mucho más por descubrir.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-fg)]">Volver al inicio</Link>
        <Link href="/categorias" className="rounded-full border border-hair px-6 py-3 text-sm font-medium hover:border-strong">Explorar categorías</Link>
      </div>

      {suggestions.length > 0 && (
        <div className="mx-auto mt-16 max-w-5xl text-left">
          <h2 className="mb-5 font-serif text-xl font-medium">Mientras tanto, no te pierdas esto</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {suggestions.map((a) => <ArticleCard key={a.slug} article={a} variant="standard" />)}
          </div>
        </div>
      )}
    </div>
  );
}
