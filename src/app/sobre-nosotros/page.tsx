import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageShell } from "@/components/layout/PageShell";
import { authors } from "@/lib/authors";
import { Avatar } from "@/components/ui/Avatar";

export const metadata: Metadata = buildMetadata({
  title: "Sobre nosotros",
  description: "Qué es HyperNews, en qué creemos y quién está detrás de nuestros artículos sobre inteligencia artificial, psicología, historia y negocios.",
  path: "/sobre-nosotros",
});

export default function AboutPage() {
  return (
    <PageShell
      title="Sobre HyperNews"
      intro="Un medio independiente que explica bien tres cosas que nos apasionan: la inteligencia artificial y sus herramientas, la psicología de la vida cotidiana, y la historia de las empresas y la tecnología."
    >
      <h2>En qué creemos</h2>
      <p>Vivimos rodeados de titulares que gritan y de contenido escrito para el algoritmo, no para las personas. HyperNews nace de la convicción contraria: que un buen artículo respeta tu tiempo, explica sin condescendencia y te deja sabiendo algo que antes no sabías.</p>
      <p>No perseguimos el clic fácil. Perseguimos que termines de leer y pienses «esto sí valía la pena».</p>
      <h2>Nuestros temas</h2>
      <ul>
        <li><strong>Inteligencia Artificial:</strong> herramientas útiles, guías prácticas y análisis sin humo.</li>
        <li><strong>Psicología:</strong> comportamiento, hábitos y relaciones, con base en la evidencia.</li>
        <li><strong>Historia &amp; Negocios:</strong> las historias detrás de las empresas y los inventos que cambiaron el mundo.</li>
      </ul>
      <h2>El equipo</h2>
      <p>Detrás de cada artículo hay una persona con nombre y criterio. Estos son algunos de ellos:</p>
      <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2">
        {authors.filter((a) => a.slug !== "equipo-hypernews").map((a) => (
          <div key={a.slug} className="flex items-start gap-3 rounded-xl border border-hair p-4">
            <Avatar author={a.slug} size={44} />
            <div>
              <p className="font-semibold">{a.name}</p>
              <p className="text-sm text-muted">{a.role}</p>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
