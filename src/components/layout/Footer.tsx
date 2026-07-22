import Link from "next/link";
import { primaryCategories } from "@/lib/categories";
import { site } from "@/lib/site";
import { Logo } from "./Logo";

const explore = [
  { label: "Inicio", href: "/" },
  { label: "Todos los artículos", href: "/articulos" },
  { label: "Lo más leído", href: "/tendencias" },
  { label: "Boletín", href: "/newsletter" },
];

const about = [
  { label: "Sobre HyperNews", href: "/sobre-nosotros" },
  { label: "Contacto", href: "/contacto" },
  { label: "Aviso legal", href: "/aviso-legal" },
  { label: "Privacidad", href: "/privacidad" },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-hair bg-subtle">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted">{site.description}</p>
            <div className="mt-5 flex gap-2">
              {site.social.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} className="grid h-9 w-9 place-items-center rounded-full border border-hair text-muted transition-colors hover:border-strong hover:text-fg">
                  <SocialIcon name={s.icon} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Temas</h3>
            <ul className="space-y-2 text-sm">
              {primaryCategories.map((c) => (
                <li key={c.slug}><Link href={`/categoria/${c.slug}`} className="text-muted transition-colors hover:text-fg">{c.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Explora</h3>
            <ul className="space-y-2 text-sm">
              {explore.map((l) => (
                <li key={l.href}><Link href={l.href} className="text-muted transition-colors hover:text-fg">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">HyperNews</h3>
            <ul className="space-y-2 text-sm">
              {about.map((l) => (
                <li key={l.href}><Link href={l.href} className="text-muted transition-colors hover:text-fg">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-hair pt-6 text-sm text-subtle sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {site.name}. Todos los derechos reservados.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/sitemap.xml" className="hover:text-fg">Mapa del sitio</Link>
            <Link href="/feed.xml" className="hover:text-fg">RSS</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: string }) {
  const p = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor" } as const;
  switch (name) {
    case "x":
      return <svg {...p}><path d="M18.9 2H22l-7 8 8.2 12h-6.4l-5-6.6L6 22H2.9l7.5-8.6L2.4 2h6.6l4.5 6zM17.8 20h1.7L7.3 3.8H5.5z" /></svg>;
    case "instagram":
      return <svg {...p} fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>;
    case "linkedin":
      return <svg {...p}><path d="M4.98 3.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9z" /></svg>;
    case "youtube":
      return <svg {...p}><path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 00-1.7-1.7C19.3 5.2 12 5.2 12 5.2s-7.3 0-8.9.4A2.5 2.5 0 001.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 001.7 1.7c1.6.4 8.9.4 8.9.4s7.3 0 8.9-.4a2.5 2.5 0 001.7-1.7c.4-1.5.4-4.7.4-4.7zM9.8 15.3V8.7l5.7 3.3z" /></svg>;
    case "rss":
      return <svg {...p} fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 11a9 9 0 019 9M4 4a16 16 0 0116 16" /><circle cx="5" cy="19" r="1.5" fill="currentColor" /></svg>;
    default:
      return null;
  }
}
