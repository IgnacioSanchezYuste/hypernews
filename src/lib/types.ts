/**
 * HyperNews — Domain model
 * Framework-agnostic content types. This is the contract every data source
 * (mock seed today, a headless CMS / database tomorrow) must satisfy.
 */

export interface Category {
  slug: string;
  name: string;
  /** Short SEO/marketing description */
  description: string;
  /** Emoji or short glyph used for compact visuals */
  glyph: string;
  /** Accent color (hex) used for badges, gradients and cover art */
  color: string;
  /** Parent category slug for subcategories */
  parent?: string;
  /** Sort weight (lower = earlier) */
  order?: number;
  /** Featured in the primary navbar */
  primary?: boolean;
}

export interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
  /** Initials fallback avatar color */
  color: string;
  twitter?: string;
  linkedin?: string;
}

/** Structured content blocks — enables TOC, FAQ schema and pixel-perfect layout. */
export type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string; id: string }
  | { type: "image"; alt: string; caption?: string; seed: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "code"; language: string; code: string }
  | { type: "callout"; tone: "info" | "tip" | "warn"; title?: string; text: string }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "video"; provider: "youtube"; id: string; title: string }
  | { type: "faq"; items: { q: string; a: string }[] }
  | { type: "divider" };

export interface ArticleImage {
  /** Absolute image URL (editorial photography) */
  url: string;
  alt: string;
  /** Optional photo credit shown under hero images */
  credit?: string;
}

export interface Article {
  slug: string;
  title: string;
  /** One-sentence hook shown in cards and meta description */
  excerpt: string;
  /** Featured photograph used on cards and the article hero */
  image: ArticleImage;
  /** Deterministic seed kept as a graceful fallback for generated art */
  coverSeed: string;
  category: string; // Category slug
  tags: string[];
  author: string; // Author slug
  publishedAt: string; // ISO date
  updatedAt?: string;
  blocks: Block[];
  featured?: boolean;
  trending?: boolean;
  /** Editorial series this article belongs to */
  series?: string;
  /** Popularity signal used for "most read" ranking */
  views: number;
  comments?: number;
}

