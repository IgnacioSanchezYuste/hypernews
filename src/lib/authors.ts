import type { Author } from "./types";

export const authors: Author[] = [
  { slug: "elena-marquez", name: "Elena Márquez", role: "Editora jefa · Tecnología", color: "#2f6bff", bio: "Periodista tecnológica con más de una década cubriendo la intersección entre software, sociedad y negocio. Antes en medios de referencia, ahora liderando la redacción de HyperNews.", twitter: "elenamarquez" },
  { slug: "dario-fuentes", name: "Darío Fuentes", role: "Redactor senior · IA y Ciencia", color: "#7c3aed", bio: "Físico reconvertido en divulgador. Escribe sobre inteligencia artificial, espacio y las grandes preguntas de la ciencia con una obsesión sana por la claridad.", twitter: "dariofuentes" },
  { slug: "noa-ibrahim", name: "Noa Ibrahim", role: "Redactora · Negocios y Startups", color: "#b45309", bio: "Analista de mercado y ex-fundadora. Traduce el ruido del ecosistema emprendedor en señales que importan.", twitter: "noaibrahim" },
  { slug: "hugo-serrano", name: "Hugo Serrano", role: "Editor · Cultura", color: "#be123c", bio: "Crítico cultural. Cine, música y videojuegos vistos como lo que son: espejos de nuestra época.", twitter: "hugoserrano" },
  { slug: "mara-costa", name: "Mara Costa", role: "Redactora · Estilo de vida", color: "#e11d48", bio: "Escribe sobre viajes, gastronomía y el arte de vivir con intención. Ha comido en 30 países y sigue prefiriendo el pan con tomate.", twitter: "maracosta" },
  { slug: "equipo-hypernews", name: "Redacción HyperNews", role: "Equipo editorial", color: "#0d9488", bio: "Artículos elaborados por el equipo editorial de HyperNews." },
];

export const authorBySlug = new Map(authors.map((a) => [a.slug, a]));

export function getAuthor(slug: string): Author | undefined {
  return authorBySlug.get(slug);
}
