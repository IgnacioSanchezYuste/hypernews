import { getAuthor } from "@/lib/authors";

/** Initials avatar with the author's identity color. Deterministic, imageless. */
export function Avatar({ author, size = 36 }: { author: string; size?: number }) {
  const a = getAuthor(author);
  const initials = (a?.name ?? "HN")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(135deg, ${a?.color ?? "#2f6bff"}, color-mix(in oklab, ${a?.color ?? "#2f6bff"} 60%, black))`,
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
