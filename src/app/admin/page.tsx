import Link from "next/link";
import { allArticles } from "@/lib/articles";
import { categories } from "@/lib/categories";
import { authors } from "@/lib/authors";
import { formatViews, formatDate } from "@/lib/utils";
import { getCategory } from "@/lib/categories";

function Stat({ label, value, delta, positive = true }: { label: string; value: string; delta: string; positive?: boolean }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className={`mt-1 text-xs font-medium ${positive ? "text-green-600" : "text-red-500"}`}>{positive ? "▲" : "▼"} {delta} vs. mes anterior</p>
    </div>
  );
}

export default function AdminDashboard() {
  const totalViews = allArticles.reduce((s, a) => s + a.views, 0);
  const totalComments = allArticles.reduce((s, a) => s + (a.comments ?? 0), 0);
  const recent = [...allArticles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, 6);

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium">Buenos días, Elena 👋</h1>
      <p className="mt-1 text-muted">Esto es lo que ha pasado en HyperNews.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Visitas totales" value={formatViews(totalViews)} delta="12,4%" />
        <Stat label="Artículos publicados" value={String(allArticles.length)} delta="8 nuevos" />
        <Stat label="Comentarios" value={formatViews(totalComments)} delta="5,1%" />
        <Stat label="Suscriptores" value="48,2k" delta="3,7%" />
      </div>

      {/* Fake traffic chart */}
      <div className="card mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Tráfico · últimos 14 días</h2>
          <span className="pill bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">En vivo</span>
        </div>
        <div className="mt-6 flex h-40 items-end gap-1.5">
          {[38, 42, 40, 55, 48, 62, 58, 70, 65, 78, 72, 85, 80, 94].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-md bg-brand-500/80 transition-all hover:bg-brand-600" style={{ height: `${h}%` }} title={`Día ${i + 1}`} />
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recent articles */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-hair p-5">
            <h2 className="font-semibold">Artículos recientes</h2>
            <Link href="/admin/articulos" className="text-sm font-medium text-[var(--accent)]">Ver todos →</Link>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {recent.map((a) => (
                <tr key={a.slug} className="border-b border-hair last:border-0">
                  <td className="max-w-0 px-5 py-3">
                    <p className="truncate font-medium">{a.title}</p>
                    <p className="text-xs text-muted">{getCategory(a.category)?.name} · {formatDate(a.publishedAt)}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-muted">{formatViews(a.views)} 👁</td>
                  <td className="px-5 py-3 text-right"><span className="pill bg-green-500/10 text-green-600">Publicado</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick facts */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold">Resumen</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li className="flex justify-between"><span>Categorías</span><span className="font-medium text-fg">{categories.length}</span></li>
              <li className="flex justify-between"><span>Autores activos</span><span className="font-medium text-fg">{authors.length}</span></li>
              <li className="flex justify-between"><span>Borradores</span><span className="font-medium text-fg">3</span></li>
              <li className="flex justify-between"><span>Programados</span><span className="font-medium text-fg">2</span></li>
            </ul>
          </div>
          <div className="card p-5">
            <h2 className="font-semibold">Acciones rápidas</h2>
            <div className="mt-3 grid gap-2">
              <Link href="/admin/articulos/nuevo" className="rounded-lg bg-muted px-3 py-2 text-sm font-medium hover:bg-brand-50">✍️ Escribir artículo</Link>
              <Link href="/admin/recursos" className="rounded-lg bg-muted px-3 py-2 text-sm font-medium hover:bg-brand-50">◈ Añadir recurso</Link>
              <Link href="/admin/estadisticas" className="rounded-lg bg-muted px-3 py-2 text-sm font-medium hover:bg-brand-50">◔ Ver analíticas</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
