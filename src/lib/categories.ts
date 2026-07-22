import type { Category } from "./types";

/**
 * Editorial taxonomy — three focused verticals. Every category below has real,
 * navigable content. We deliberately keep the taxonomy small: no empty sections.
 */
export const categories: Category[] = [
  {
    slug: "inteligencia-artificial",
    name: "Inteligencia Artificial",
    glyph: "✦",
    color: "#1188bd",
    primary: true,
    order: 1,
    description:
      "Análisis, guías y herramientas útiles de IA explicadas sin humo, para aplicarlas de verdad en tu día a día y tu trabajo.",
  },
  {
    slug: "psicologia",
    name: "Psicología",
    glyph: "◐",
    color: "#b8506a",
    primary: true,
    order: 2,
    description:
      "Psicología cotidiana: cómo pensamos, cómo nos relacionamos y por qué hacemos lo que hacemos. Ciencia del comportamiento aplicada a la vida real.",
  },
  {
    slug: "historia-negocios",
    name: "Historia & Negocios",
    glyph: "❦",
    color: "#b07d2b",
    primary: true,
    order: 3,
    description:
      "La historia detrás de las grandes empresas, decisiones de negocio y avances tecnológicos que moldearon el mundo que habitamos.",
  },
];

export const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

export function getCategory(slug: string): Category | undefined {
  return categoryBySlug.get(slug);
}

export const primaryCategories = categories
  .filter((c) => c.primary)
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

export function subcategoriesOf(slug: string): Category[] {
  return categories.filter((c) => c.parent === slug);
}
