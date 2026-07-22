import type { Metadata } from "next";
import { site } from "./site";
import type { Article } from "./types";
import { getAuthor } from "./authors";
import { getCategory } from "./categories";

/** Absolute URL helper for canonical/OG tags. */
export function absoluteUrl(path = "/"): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Dynamic OG image endpoint (rendered via /api/og). */
export function ogImage(title: string, subtitle: string = site.name): string {
  const params = new URLSearchParams({ title, subtitle });
  return absoluteUrl(`/api/og?${params.toString()}`);
}

interface MetaInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
  keywords?: string[];
}

/** Build a complete, consistent Metadata object for any page. */
export function buildMetadata(input: MetaInput): Metadata {
  const url = absoluteUrl(input.path);
  const image = input.image ?? ogImage(input.title);
  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: site.name,
      locale: site.locale,
      type: input.type ?? "website",
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
      publishedTime: input.publishedTime,
      authors: input.authors,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      site: site.twitter,
      images: [image],
    },
  };
}

/* ── JSON-LD structured data builders ─────────────────────────────── */

export function articleJsonLd(article: Article) {
  const author = getAuthor(article.author);
  const category = getCategory(article.category);
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: [ogImage(article.title, category?.name)],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: author
      ? { "@type": "Person", name: author.name, url: absoluteUrl(`/autor/${author.slug}`) }
      : { "@type": "Organization", name: site.name },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: { "@type": "ImageObject", url: absoluteUrl("/icon.png") },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/articulo/${article.slug}`) },
    articleSection: category?.name,
    keywords: article.tags.join(", "),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: absoluteUrl("/buscar?q={query}") },
      "query-input": "required name=query",
    },
  };
}
