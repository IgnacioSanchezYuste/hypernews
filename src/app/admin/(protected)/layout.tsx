import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { verifySession } from "@/lib/dal";
import { logout } from "@/app/admin/login/actions";

export const metadata: Metadata = {
  title: "Panel de administración",
  robots: { index: false, follow: false },
};

const nav = [
  { label: "Dashboard", href: "/admin", icon: "◧" },
  { label: "Artículos", href: "/admin/articulos", icon: "▤" },
  { label: "Categorías", href: "/admin/categorias", icon: "◆" },
  { label: "Autores", href: "/admin/autores", icon: "◍" },
  { label: "Comentarios", href: "/admin/comentarios", icon: "💬" },
  { label: "Estadísticas", href: "/admin/estadisticas", icon: "◔" },
  { label: "Publicidad", href: "/admin/publicidad", icon: "▣" },
  { label: "Configuración", href: "/admin/configuracion", icon: "⚙" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();

  return (
    <div className="min-h-dvh bg-subtle">
      <div className="mx-auto flex max-w-[100rem]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-hair bg-surface p-4 lg:flex">
          <Link href="/admin" className="mb-6 px-2 pt-2"><Logo /></Link>
          <nav className="flex-1 space-y-0.5">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-muted hover:text-fg">
                <span className="text-base" aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="mt-4 rounded-lg px-3 py-2 text-sm text-muted hover:text-fg">← Volver al sitio</Link>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-hair bg-surface/80 px-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 lg:hidden"><Logo compact /></div>
            <div className="hidden text-sm text-muted lg:block">Panel de administración</div>
            <div className="flex items-center gap-3">
              <Link href="/admin/articulos/nuevo" className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-fg)]">+ Nuevo artículo</Link>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white" title={session.name}>{initials(session.name)}</span>
              <form action={logout}>
                <button type="submit" className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-muted hover:text-fg">Salir</button>
              </form>
            </div>
          </header>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
