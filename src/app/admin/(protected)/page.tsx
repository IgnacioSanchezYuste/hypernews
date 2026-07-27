import Link from "next/link";
import { getAllArticles } from "@/lib/queries";
import { getCategory } from "@/lib/categories";
import { formatViews, formatDate, relativeTime } from "@/lib/utils";
import { verifySession } from "@/lib/dal";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-subtle">{hint}</p>}
    </div>
  );
}

export default async function AdminDashboard() {
  const session = await verifySession();
  const allArticles = await getAllArticles();
  const totalViews = allArticles.reduce((s, a) => s + a.views, 0);
  const curated = allArticles.filter((a) => a.source);
  const own = allArticles.length - curated.length;
  const recent = [...allArticles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, 8);
  const mostViewed = [...allArticles].sort((a, b) => b.views - a.views).slice(0, 5);
  const lastCurated = curated.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())[0];

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium">Buenos días, {session.name} 👋</h1>
      <p className="mt-1 text-muted">Estado real de HyperNews — sin cifras de relleno.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Artículos publicados" value={String(allArticles.length)} />
        <Stat label="Lecturas registradas" value={formatViews(totalViews)} hint="Se cuentan al abrir un artículo" />
        <Stat label="Noticias curadas" value={String(curated.length)} hint={`de fuentes externas · ${own} propias`} />
        <Stat
          label="Última curación automática"
          value={lastCurated ? relativeTime(lastCurated.publishedAt) : "—"}
          hint={lastCurated ? formatDate(lastCurated.publishedAt) : "todavía no se ha ejecutado"}
        />
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
                  <td className="px-5 py-3 text-right">
                    {a.source ? (
                      <span className="pill bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">Curada</span>
                    ) : (
                      <span className="pill bg-green-500/10 text-green-600">Redacción</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Real quick facts */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold">Más leídos</h2>
            <ul className="mt-3 space-y-2.5 text-sm">
              {mostViewed.map((a) => (
                <li key={a.slug} className="flex items-center justify-between gap-3">
                  <Link href={`/articulo/${a.slug}`} className="truncate text-muted hover:text-fg">{a.title}</Link>
                  <span className="shrink-0 font-medium text-fg">{formatViews(a.views)}</span>
                </li>
              ))}
              {mostViewed.length === 0 && <li className="text-muted">Todavía no hay lecturas registradas.</li>}
            </ul>
          </div>
          <div className="card p-5">
            <h2 className="font-semibold">Acciones rápidas</h2>
            <div className="mt-3 grid gap-2">
              <Link href="/admin/articulos/nuevo" className="rounded-lg bg-muted px-3 py-2 text-sm font-medium hover:bg-brand-50">✍️ Escribir artículo</Link>
              <Link href="/admin/articulos" className="rounded-lg bg-muted px-3 py-2 text-sm font-medium hover:bg-brand-50">▤ Gestionar artículos</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
