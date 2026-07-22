/** Consistent "module scaffolded" screen for admin sections pending a backend. */
export function AdminPlaceholder({
  title,
  description,
  features,
}: {
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <div>
      <h1 className="font-serif text-2xl font-medium">{title}</h1>
      <p className="mt-1 max-w-2xl text-muted">{description}</p>
      <div className="card mt-6 p-8">
        <span className="pill bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">Módulo listo para conectar</span>
        <p className="mt-4 max-w-xl text-sm text-muted">
          La interfaz y la arquitectura de este módulo están definidas. Conéctalo a tu backend
          (base de datos, autenticación y almacenamiento) para activarlo.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2 rounded-xl border border-hair bg-subtle px-4 py-3 text-sm">
              <span className="text-[var(--accent)]" aria-hidden>✓</span> {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
