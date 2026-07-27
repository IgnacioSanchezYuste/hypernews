import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getAllArticles } from "@/lib/queries";
import { categories } from "@/lib/categories";
import { authors } from "@/lib/authors";

/** Refreshed on the same cadence as the catalogue cache. */
export const revalidate = 3600;

/** Automatic sitemap covering every indexable route. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const abs = (p: string) => `${site.url}${p}`;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: abs("/"), lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: abs("/articulos"), lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: abs("/categorias"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: abs("/tendencias"), lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: abs("/newsletter"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: abs("/sobre-nosotros"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: abs("/contacto"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const articles = await getAllArticles();
  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: abs(`/articulo/${a.slug}`),
    lastModified: new Date(a.updatedAt ?? a.publishedAt),
    changeFrequency: "weekly",
    priority: a.featured ? 0.9 : 0.6,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: abs(`/categoria/${c.slug}`),
    lastModified: now,
    changeFrequency: "daily",
    priority: c.primary ? 0.8 : 0.6,
  }));

  const authorRoutes: MetadataRoute.Sitemap = authors.map((a) => ({
    url: abs(`/autor/${a.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...articleRoutes, ...categoryRoutes, ...authorRoutes];
}
