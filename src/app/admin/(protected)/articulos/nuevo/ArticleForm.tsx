"use client";

import { useActionState } from "react";
import { createArticle, type ArticleFormState } from "../actions";
import type { Author, Category } from "@/lib/types";

const initialState: ArticleFormState = {};

export function ArticleForm({
  primaryCategories,
  categories,
  authors,
}: {
  primaryCategories: Category[];
  categories: Category[];
  authors: Author[];
}) {
  const [state, formAction, pending] = useActionState(createArticle, initialState);

  return (
    <form action={formAction}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">Rellena el contenido y publica directamente.</p>
        <button type="submit" disabled={pending} className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-fg)] disabled:opacity-60">
          {pending ? "Publicando…" : "Publicar"}
        </button>
      </div>

      {state?.error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{state.error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
        {/* Editor */}
        <div className="space-y-4">
          <input name="title" required placeholder="Título del artículo" className="w-full rounded-xl border border-hair bg-surface px-4 py-3 font-serif text-2xl outline-none focus:border-[var(--accent)]" />
          <input name="excerpt" required placeholder="Extracto / gancho (aparece en tarjetas y buscadores)" className="w-full rounded-xl border border-hair bg-surface px-4 py-3 text-sm outline-none focus:border-[var(--accent)]" />
          <textarea
            name="body"
            required
            rows={16}
            placeholder="Escribe aquí tu historia… Separa los párrafos con una línea en blanco."
            className="w-full rounded-xl border border-hair bg-surface p-4 text-[0.95rem] leading-relaxed outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Settings sidebar */}
        <aside className="space-y-4">
          <Panel title="Publicación">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" className="accent-[var(--accent)]" /> Artículo destacado</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="trending" className="accent-[var(--accent)]" /> Marcar como tendencia</label>
          </Panel>

          <Panel title="Organización">
            <Field label="Categoría">
              <select name="category" required defaultValue="" className="admin-input">
                <option value="" disabled>Selecciona una categoría</option>
                {primaryCategories.map((p) => (
                  <optgroup key={p.slug} label={p.name}>
                    <option value={p.slug}>{p.name}</option>
                    {categories.filter((c) => c.parent === p.slug).map((c) => <option key={c.slug} value={c.slug}>— {c.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field label="Autor">
              <select name="author" required defaultValue="" className="admin-input">
                <option value="" disabled>Selecciona un autor</option>
                {authors.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
              </select>
            </Field>
            <Field label="Etiquetas">
              <input name="tags" placeholder="ia, futuro, guía" className="admin-input" />
            </Field>
          </Panel>

          <Panel title="Slug">
            <Field label="Slug (opcional)"><input name="slug" className="admin-input" placeholder="se-genera-del-título-si-lo-dejas-vacío" /></Field>
          </Panel>

          <Panel title="Imagen de portada">
            <Field label="URL de la imagen"><input name="imageUrl" type="url" required className="admin-input" placeholder="https://…" /></Field>
            <Field label="Texto alternativo"><input name="imageAlt" required className="admin-input" placeholder="Descripción de la foto" /></Field>
            <Field label="Crédito (opcional)"><input name="imageCredit" className="admin-input" placeholder="Nombre del fotógrafo / fuente" /></Field>
          </Panel>
        </aside>
      </div>
    </form>
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
