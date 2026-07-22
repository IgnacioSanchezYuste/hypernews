import Link from "next/link";

export function Breadcrumbs({ items }: { items: { name: string; path?: string }[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {item.path ? (
            <Link href={item.path} className="transition-colors hover:text-fg">{item.name}</Link>
          ) : (
            <span className="text-fg" aria-current="page">{item.name}</span>
          )}
          {i < items.length - 1 && <span aria-hidden className="text-subtle">/</span>}
        </span>
      ))}
    </nav>
  );
}
