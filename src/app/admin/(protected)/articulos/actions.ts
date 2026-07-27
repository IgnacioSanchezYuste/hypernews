"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { insertArticle, articleSlugExists, deleteArticle } from "@/lib/articles-db";
import { ARTICLES_TAG } from "@/lib/articles-cache";
import { categories } from "@/lib/categories";
import { authors } from "@/lib/authors";
import { slugify } from "@/lib/utils";
import type { Block } from "@/lib/types";

export interface ArticleFormState {
  error?: string;
}

const LIMITS = {
  title: 200,
  excerpt: 400,
  body: 120_000,
  imageUrl: 2_000,
  imageAlt: 300,
  imageCredit: 120,
  slug: 120,
  tag: 40,
  tags: 8,
} as const;

function field(formData: FormData, name: string, max: number): string {
  return String(formData.get(name) ?? "").trim().slice(0, max);
}

/** Only absolute HTTPS URLs reach next/image, so anything else is rejected here. */
function isValidImageUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function bodyToBlocks(body: string): Block[] {
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((text) => ({ type: "paragraph", text }));
}

/** Paths whose content changes whenever an article is created or removed. */
function revalidateArticleSurfaces() {
  // updateTag (not revalidateTag) so the editor sees the change on the very
  // next request instead of one stale render later.
  updateTag(ARTICLES_TAG);
  revalidatePath("/admin/articulos");
  revalidatePath("/");
  revalidatePath("/articulos");
  revalidatePath("/sitemap.xml");
}

export async function createArticle(_prevState: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  await verifySession();

  const title = field(formData, "title", LIMITS.title);
  const excerpt = field(formData, "excerpt", LIMITS.excerpt);
  const body = field(formData, "body", LIMITS.body);
  const imageUrl = field(formData, "imageUrl", LIMITS.imageUrl);
  const imageAlt = field(formData, "imageAlt", LIMITS.imageAlt);
  const imageCredit = field(formData, "imageCredit", LIMITS.imageCredit);
  const category = field(formData, "category", 80);
  const author = field(formData, "author", 80);
  const tagsRaw = field(formData, "tags", LIMITS.tag * LIMITS.tags * 2);
  const featured = formData.get("featured") === "on";
  const trending = formData.get("trending") === "on";
  let slug = field(formData, "slug", LIMITS.slug);

  if (!title || !excerpt || !body || !imageUrl || !imageAlt || !category || !author) {
    return { error: "Completa título, extracto, texto, imagen y categoría/autor." };
  }

  if (!isValidImageUrl(imageUrl)) {
    return { error: "La URL de la imagen debe ser una dirección https:// válida." };
  }

  // The form uses <select>, but a server action is a public endpoint: never
  // trust that the value came from the markup we rendered.
  if (!categories.some((c) => c.slug === category)) {
    return { error: "Esa categoría no existe." };
  }
  if (!authors.some((a) => a.slug === author)) {
    return { error: "Ese autor no existe." };
  }

  slug = slugify(slug || title).slice(0, LIMITS.slug);
  if (!slug) {
    return { error: "No se ha podido generar un slug válido a partir del título." };
  }

  if (await articleSlugExists(slug)) {
    return { error: `Ya existe un artículo con el slug «${slug}». Cambia el título o el slug.` };
  }

  const tags = tagsRaw
    ? [...new Set(
        tagsRaw
          .split(",")
          .map((t) => slugify(t).slice(0, LIMITS.tag))
          .filter(Boolean)
      )].slice(0, LIMITS.tags)
    : [];

  await insertArticle({
    slug,
    title,
    excerpt,
    imageUrl,
    imageAlt,
    imageCredit: imageCredit || undefined,
    category,
    tags,
    author,
    blocks: bodyToBlocks(body),
    featured,
    trending,
  });

  revalidateArticleSurfaces();
  redirect("/admin/articulos");
}

export async function removeArticle(slug: string) {
  await verifySession();

  const safeSlug = slugify(String(slug ?? "")).slice(0, LIMITS.slug);
  if (!safeSlug) return;

  await deleteArticle(safeSlug);
  revalidateArticleSurfaces();
  revalidatePath(`/articulo/${safeSlug}`);
}
