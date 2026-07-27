import Link from "next/link";
import { getAllArticles } from "@/lib/queries";
import { getCategory } from "@/lib/categories";
import { getAuthor } from "@/lib/authors";
import { formatViews, formatDate } from "@/lib/utils";
import { removeArticle } from "./actions";

export default async function AdminArticles() {
  const articles = await getAllArticles();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium">Artículos</h1>
          <p className="mt-1 text-muted">{articles.length} artículos en total</p>
        </div>
        <Link href="/admin/articulos/nuevo" className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-fg)]">+ Nuevo</Link>
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-subtle">
              <tr>
                <th className="px-5 py-3 font-semibold">Título</th>
                <th className="px-5 py-3 font-semibold">Categoría</th>
                <th className="px-5 py-3 font-semibold">Autor</th>
                <th className="px-5 py-3 font-semibold">Fecha</th>
                <th className="px-5 py-3 text-right font-semibold">Visitas</th>
                <th className="px-5 py-3 text-right font-semibold">Estado</th>
                <th className="px-5 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {articles.slice(0, 50).map((a) => (
                <tr key={a.slug} className="border-t border-hair hover:bg-subtle">
                  <td className="max-w-xs px-5 py-3"><p className="truncate font-medium">{a.title}</p></td>
                  <td className="whitespace-nowrap px-5 py-3 text-muted">{getCategory(a.category)?.name}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-muted">{getAuthor(a.author)?.name}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-muted">{formatDate(a.publishedAt)}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-muted">{formatViews(a.views)}</td>
                  <td className="px-5 py-3 text-right">
                    {a.featured ? <span className="pill bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">Destacado</span> : <span className="pill bg-green-500/10 text-green-600">Publicado</span>}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    <div className="flex justify-end gap-1.5 text-muted">
                      <Link href={`/articulo/${a.slug}`} className="rounded-md px-2 py-1 hover:bg-muted hover:text-fg" title="Ver">👁</Link>
                      <form action={removeArticle.bind(null, a.slug)}>
                        <button type="submit" className="rounded-md px-2 py-1 hover:bg-red-500/10 hover:text-red-500" title="Eliminar">🗑</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-muted">Mostrando {Math.min(50, articles.length)} de {articles.length}</p>
    </div>
  );
}
