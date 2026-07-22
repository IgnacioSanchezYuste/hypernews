import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Newsletter } from "@/components/marketing/Newsletter";

export const metadata: Metadata = buildMetadata({
  title: "Newsletter — Suscríbete al boletín",
  description: "Recibe cada mañana una selección editorial de lo mejor de HyperNews. Sin ruido, sin spam.",
  path: "/newsletter",
});

const perks = [
  { icon: "✦", title: "Selección editorial", text: "Nuestro equipo elige lo esencial. Tú ahorras horas de scroll." },
  { icon: "⚡", title: "Cada mañana", text: "Listo para leer con el café. Tiempo de lectura: 4 minutos." },
  { icon: "◈", title: "Solo señal", text: "Sin clickbait ni relleno. Cancela cuando quieras, con un clic." },
];

export default function NewsletterPage() {
  return (
    <div className="container-page py-12">
      <Newsletter />
      <div className="mx-auto mt-4 grid max-w-4xl gap-6 md:grid-cols-3">
        {perks.map((p) => (
          <div key={p.title} className="card p-6">
            <span className="text-2xl text-[var(--accent)]" aria-hidden>{p.icon}</span>
            <h3 className="mt-3 font-semibold">{p.title}</h3>
            <p className="mt-1 text-sm text-muted">{p.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
