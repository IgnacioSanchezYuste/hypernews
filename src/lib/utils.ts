import type { Block } from "./types";

/** Merge class names, dropping falsy values. Lightweight clsx. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const WORDS_PER_MINUTE = 220;

/** Estimate reading time (minutes) from structured blocks. */
export function readingMinutes(blocks: Block[]): number {
  const words = blocks.reduce((sum, b) => {
    switch (b.type) {
      case "paragraph":
      case "heading":
        return sum + b.text.split(/\s+/).length;
      case "quote":
        return sum + b.text.split(/\s+/).length;
      case "list":
        return sum + b.items.join(" ").split(/\s+/).length;
      case "callout":
        return sum + b.text.split(/\s+/).length;
      case "faq":
        return sum + b.items.map((i) => i.q + " " + i.a).join(" ").split(/\s+/).length;
      default:
        return sum;
    }
  }, 0);
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Extract the heading blocks as a table of contents. */
export function tableOfContents(blocks: Block[]) {
  return blocks
    .filter((b): b is Extract<Block, { type: "heading" }> => b.type === "heading")
    .map((b) => ({ id: b.id, text: b.text, level: b.level }));
}

const DATE_FMT = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(iso: string): string {
  return DATE_FMT.format(new Date(iso));
}

/** Human relative time in Spanish (e.g. "hace 3 días"). */
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  const hrs = Math.round(mins / 60);
  const days = Math.round(hrs / 24);
  if (mins < 60) return `hace ${mins} min`;
  if (hrs < 24) return `hace ${hrs} h`;
  if (days < 30) return `hace ${days} d`;
  return formatDate(iso);
}

export function formatViews(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".0", "") + "k";
  return String(n);
}

/** Deterministic pseudo-random in [0,1) from a string seed (for cover art). */
export function seededRandom(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}
