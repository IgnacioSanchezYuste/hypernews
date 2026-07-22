"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { primaryCategories } from "@/lib/categories";
import { site } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";

const today = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

const mainLinks = [
  { label: "Inicio", href: "/" },
  ...primaryCategories.map((c) => ({ label: c.name, href: `/categoria/${c.slug}` })),
  { label: "Lo más leído", href: "/tendencias" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  const openSearch = () => (window as unknown as { __openSearch?: () => void }).__openSearch?.();

  return (
    <header className="relative z-50 bg-page">
      {/* Top bar */}
      <div className="hidden border-b border-hair bg-subtle sm:block">
        <div className="container-page flex h-9 items-center justify-between text-xs text-muted">
          <span className="capitalize">{today}</span>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline">{site.tagline}</span>
            <span className="hidden h-3 w-px bg-border-strong md:inline-block" style={{ backgroundColor: "var(--border-strong)" }} />
            <ThemeToggle compact />
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div className="container-page flex items-center justify-between gap-4 py-4">
        <Link href="/" aria-label={`${site.name} inicio`}>
          <Logo size={38} />
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={openSearch}
            className="hidden items-center gap-2 rounded-full border border-hair px-3.5 py-2 text-sm text-muted transition-colors hover:border-strong hover:text-fg sm:flex"
            aria-label="Buscar"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            <span className="hidden md:inline">Buscar</span>
            <kbd className="hidden rounded border border-hair px-1 text-[10px] md:inline">⌘K</kbd>
          </button>
          <Link href="/newsletter" className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-fg)] transition-transform hover:-translate-y-0.5">
            Suscríbete
          </Link>
          <button onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-full border border-hair text-muted lg:hidden" aria-label="Abrir menú">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
        </div>
      </div>

      {/* Primary nav bar — sticky, centered links */}
      <nav className={`sticky top-0 z-40 hidden border-y border-hair transition-colors lg:block ${scrolled ? "nav-blur backdrop-blur-xl" : "bg-page"}`} aria-label="Principal">
        <div className="container-page flex h-12 items-center justify-center gap-1">
          {scrolled && (
            <Link href="/" className="absolute left-5 flex items-center" aria-label="Inicio"><Logo compact size={26} /></Link>
          )}
          {mainLinks.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-md px-3.5 py-1.5 text-sm font-medium text-muted transition-colors hover:text-brand-600">
              {l.label}
            </Link>
          ))}
          {scrolled && (
            <button onClick={openSearch} className="absolute right-5 grid h-8 w-8 place-items-center rounded-full text-muted hover:text-fg" aria-label="Buscar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            </button>
          )}
        </div>
      </nav>

      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
    </header>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const openSearch = () => { onClose(); (window as unknown as { __openSearch?: () => void }).__openSearch?.(); };
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[84%] max-w-sm overflow-y-auto bg-surface p-6 shadow-lift">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <button onClick={onClose} aria-label="Cerrar" className="grid h-9 w-9 place-items-center rounded-full border border-hair">✕</button>
        </div>
        <button onClick={openSearch} className="mb-6 flex w-full items-center gap-2 rounded-full border border-hair px-4 py-2.5 text-sm text-muted">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          Buscar en HyperNews…
        </button>
        <nav className="space-y-1" aria-label="Menú móvil">
          {mainLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={onClose} className="block rounded-lg px-3 py-2.5 text-base font-medium hover:bg-muted">{l.label}</Link>
          ))}
        </nav>
        <Link href="/newsletter" onClick={onClose} className="mt-6 block rounded-full bg-[var(--accent)] px-4 py-3 text-center font-semibold text-[var(--accent-fg)]">Suscríbete al boletín</Link>
      </div>
    </div>
  );
}
