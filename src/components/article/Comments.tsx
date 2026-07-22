"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";

/**
 * Lightweight comments UI. Local-only demo state; wire `onSubmit` to your
 * backend / a provider (e.g. a serverless function + database) when ready.
 */
export function Comments({ count = 0 }: { count?: number }) {
  const [comments, setComments] = useState<{ name: string; text: string; at: string }[]>([
    { name: "Lucía R.", text: "Excelente análisis, me ha aclarado varias dudas que tenía. ¡Gracias!", at: "hace 2 h" },
    { name: "Marcos T.", text: "No estoy del todo de acuerdo con el segundo punto, pero muy bien argumentado.", at: "hace 5 h" },
  ]);
  const [text, setText] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setComments((c) => [{ name: "Tú", text: text.trim(), at: "ahora" }, ...c]);
    setText("");
  }

  return (
    <section id="comentarios" className="mt-14 border-t border-hair pt-10">
      <h2 className="font-serif text-2xl font-medium">Comentarios <span className="text-muted">({count || comments.length})</span></h2>

      <form onSubmit={submit} className="mt-6 flex gap-3">
        <Avatar author="equipo-hypernews" size={40} />
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Añade tu comentario…"
            className="w-full resize-none rounded-2xl border border-hair bg-surface p-4 text-sm outline-none transition-colors focus:border-[var(--accent)]"
          />
          <div className="mt-2 flex justify-end">
            <button type="submit" className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-[var(--accent-fg)] disabled:opacity-50" disabled={!text.trim()}>
              Publicar
            </button>
          </div>
        </div>
      </form>

      <ul className="mt-8 space-y-6">
        {comments.map((c, i) => (
          <li key={i} className="flex gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold text-muted">{c.name[0]}</span>
            <div>
              <p className="text-sm"><span className="font-semibold">{c.name}</span> <span className="text-subtle">· {c.at}</span></p>
              <p className="mt-1 text-sm text-muted">{c.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
