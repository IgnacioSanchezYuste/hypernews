import type { Block } from "@/lib/types";
import { CoverArt } from "@/components/ui/CoverArt";

/** Minimal inline markdown: **bold** and [text](url). Escapes the rest. */
function inline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2]) parts.push(<strong key={key++}>{m[2]}</strong>);
    else if (m[3]) parts.push(<a key={key++} href={m[4]}>{m[3]}</a>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

const calloutStyles = {
  info: { bg: "var(--bg-muted)", accent: "var(--accent)", icon: "ℹ" },
  tip: { bg: "color-mix(in oklab, #16a34a 8%, transparent)", accent: "#16a34a", icon: "✦" },
  warn: { bg: "color-mix(in oklab, #d97706 10%, transparent)", accent: "#d97706", icon: "⚠" },
} as const;

/** Renders structured article blocks into the editorial `.prose-hn` layout. */
export function ArticleBody({ blocks, category }: { blocks: Block[]; category: string }) {
  return (
    <div className="prose-hn">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "paragraph":
            return <p key={i}>{inline(block.text)}</p>;
          case "heading":
            return block.level === 2 ? (
              <h2 key={i} id={block.id}>{block.text}</h2>
            ) : (
              <h3 key={i} id={block.id}>{block.text}</h3>
            );
          case "list":
            return block.ordered ? (
              <ol key={i}>{block.items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ol>
            ) : (
              <ul key={i}>{block.items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ul>
            );
          case "quote":
            return (
              <blockquote key={i}>
                {block.text}
                {block.cite && <cite className="mt-2 block text-sm not-italic text-muted">— {block.cite}</cite>}
              </blockquote>
            );
          case "image":
            return (
              <figure key={i} className="not-prose my-8">
                <CoverArt seed={block.seed} category={category} className="aspect-[16/9] w-full" />
                {block.caption && <figcaption className="mt-2 text-center text-sm text-muted">{block.caption}</figcaption>}
              </figure>
            );
          case "code":
            return (
              <pre key={i}><code>{block.code}</code></pre>
            );
          case "callout": {
            const s = calloutStyles[block.tone];
            return (
              <div key={i} className="not-prose my-7 flex gap-3 rounded-2xl border border-hair p-5" style={{ background: s.bg, borderColor: `color-mix(in oklab, ${s.accent} 25%, transparent)` }}>
                <span className="text-lg" style={{ color: s.accent }} aria-hidden>{s.icon}</span>
                <div>
                  {block.title && <p className="mb-1 font-semibold" style={{ color: s.accent }}>{block.title}</p>}
                  <p className="text-[0.95rem] leading-relaxed text-fg">{inline(block.text)}</p>
                </div>
              </div>
            );
          }
          case "table":
            return (
              <div key={i} className="not-prose my-7 overflow-x-auto rounded-2xl border border-hair">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>{block.head.map((h, j) => <th key={j} className="px-4 py-3 text-left font-semibold">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r} className="border-t border-hair">
                        {row.map((cell, c) => <td key={c} className="px-4 py-3 text-muted">{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "video":
            return (
              <div key={i} className="not-prose my-8 aspect-video overflow-hidden rounded-2xl border border-hair">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${block.id}`}
                  title={block.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );
          case "faq":
            return (
              <div key={i} className="not-prose my-8" id="preguntas-frecuentes">
                <h2 className="mb-4 font-serif text-2xl font-medium">Preguntas frecuentes</h2>
                <div className="divide-y divide-[var(--border)] rounded-2xl border border-hair">
                  {block.items.map((it, j) => (
                    <details key={j} className="group px-5 py-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                        {it.q}
                        <span className="text-subtle transition-transform group-open:rotate-45" aria-hidden>+</span>
                      </summary>
                      <p className="mt-2 text-muted">{it.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            );
          case "divider":
            return <hr key={i} className="my-10 border-hair" />;
          default:
            return null;
        }
      })}
    </div>
  );
}
