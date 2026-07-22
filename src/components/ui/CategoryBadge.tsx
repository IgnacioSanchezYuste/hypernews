import Link from "next/link";
import { getCategory } from "@/lib/categories";

/** Small category label. On photos, `onDark` switches to a legible glass pill. */
export function CategoryBadge({
  slug,
  size = "sm",
  asLink = true,
  onDark = false,
}: {
  slug: string;
  size?: "sm" | "md";
  asLink?: boolean;
  onDark?: boolean;
}) {
  const cat = getCategory(slug);
  if (!cat) return null;

  const content = (
    <span
      className="pill uppercase"
      style={
        onDark
          ? { color: "#fff", backgroundColor: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)" }
          : { color: cat.color, backgroundColor: `color-mix(in oklab, ${cat.color} 13%, transparent)` }
      }
    >
      {cat.name}
    </span>
  );

  if (!asLink) return content;
  return (
    <Link href={`/categoria/${cat.slug}`} className="inline-flex transition-opacity hover:opacity-80" aria-label={`Categoría ${cat.name}`}>
      {content}
    </Link>
  );
}
