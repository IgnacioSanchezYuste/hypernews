import { primaryCategories, categories } from "@/lib/categories";
import { authors } from "@/lib/authors";

/** Article editor skeleton. Wire the form to a server action + your DB/CMS. */
export default function NewArticle() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Nuevo artículo</h1>
        <div className="flex gap-2">
          <button className="rounded-full border border-hair px-4 py-2 text-sm font-medium hover:border-strong">Guardar borrador</button>
          <button className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-fg)]">Publicar</button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
        {/* Editor */}
        <div className="space-y-4">
          <input placeholder="Título del artículo" className="w-full rounded-xl border border-hair bg-surface px-4 py-3 font-serif text-2xl outline-none focus:border-[var(--accent)]" />
          <input placeholder="Extracto / gancho (aparece en tarjetas y buscadores)" className="w-full rounded-xl border border-hair bg-surface px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" />

          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 rounded-t-xl border border-hair bg-muted p-2 text-sm">
            {["B", "i", "H2", "H3", "❝", "•", "1.", "‹›", "🔗", "🖼", "▦", "⚠"].map((t) => (
              <button key={t} className="rounded-md px-2.5 py-1 font-medium text-muted hover:bg-surface hover:text-fg">{t}</button>
            ))}
          </div>
          <textarea rows={16} placeholder="Escribe aquí tu historia… Editor enriquecido con bloques: párrafos, encabezados, imágenes, código, tablas, citas, FAQ y más." className="-mt-4 w-full rounded-b-xl border border-t-0 border-hair bg-surface p-4 text-[0.95rem] leading-relaxed outline-none focus:border-[var(--accent)]" />
        </div>

        {/* Settings sidebar */}
        <aside className="space-y-4">
          <Panel title="Publicación">
            <Field label="Estado">
              <select className="admin-input"><option>Borrador</option><option>Publicado</option><option>Programado</option></select>
            </Field>
            <Field label="Fecha de publicación">
              <input type="datetime-local" className="admin-input" />
            </Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[var(--accent)]" /> Artículo destacado</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[var(--accent)]" /> Marcar como tendencia</label>
          </Panel>

          <Panel title="Organización">
            <Field label="Categoría">
              <select className="admin-input">
                {primaryCategories.map((p) => (
                  <optgroup key={p.slug} label={p.name}>
                    <option value={p.slug}>{p.name}</option>
                    {categories.filter((c) => c.parent === p.slug).map((c) => <option key={c.slug} value={c.slug}>— {c.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field label="Autor">
              <select className="admin-input">{authors.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}</select>
            </Field>
            <Field label="Etiquetas">
              <input placeholder="ia, futuro, guía" className="admin-input" />
            </Field>
          </Panel>

          <Panel title="SEO">
            <Field label="Título SEO"><input className="admin-input" placeholder="Máx. 60 caracteres" /></Field>
            <Field label="Meta descripción"><textarea rows={3} className="admin-input" placeholder="Máx. 160 caracteres" /></Field>
            <Field label="Slug"><input className="admin-input" placeholder="se-genera-automaticamente" /></Field>
          </Panel>

          <Panel title="Imagen de portada">
            <div className="grid h-28 place-items-center rounded-xl border border-dashed border-hair text-sm text-subtle">Arrastra una imagen o haz clic</div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
