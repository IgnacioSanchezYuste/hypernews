import { getCategory } from "@/lib/categories";
import { seededRandom } from "@/lib/utils";

/**
 * Deterministic generated cover art. Produces a distinct, on-brand mesh
 * gradient per article using the category color + a seed — no external images,
 * zero layout shift, perfect Lighthouse scores. Renders as pure CSS/SVG.
 */
export function CoverArt({
  seed,
  category,
  glyph,
  className = "",
  rounded = "rounded-2xl",
}: {
  seed: string;
  category?: string;
  glyph?: string;
  className?: string;
  rounded?: string;
  /** Accepted for parity with CoverImage; generated art loads no resource. */
  priority?: boolean;
}) {
  const cat = category ? getCategory(category) : undefined;
  const base = cat?.color ?? "#2f6bff";
  const g = glyph ?? cat?.glyph ?? "◆";

  const r1 = seededRandom(seed);
  const r2 = seededRandom(seed + "b");
  const r3 = seededRandom(seed + "c");
  const hueShift = Math.round((r3 - 0.5) * 40);

  const style: React.CSSProperties = {
    backgroundColor: base,
    backgroundImage: `
      radial-gradient(60% 80% at ${20 + r1 * 60}% ${10 + r2 * 30}%, color-mix(in oklab, ${base} 55%, white) 0%, transparent 55%),
      radial-gradient(50% 70% at ${70 - r2 * 40}% ${80 - r1 * 30}%, color-mix(in oklab, ${base} 92%, black 30%) 0%, transparent 60%),
      radial-gradient(90% 90% at 50% 50%, color-mix(in oklab, ${base} 85%, black) 0%, ${base} 100%)`,
    filter: `hue-rotate(${hueShift}deg)`,
  };

  // Same caller-supplied `position` override as CoverImage — see its comment.
  const hasPosition = /(^|\s)(absolute|fixed|sticky|static)(\s|$)/.test(className);

  return (
    <div
      className={`${hasPosition ? "" : "relative "}overflow-hidden ${rounded} ${className}`}
      style={style}
      aria-hidden="true"
    >
      {/* Soft grain / gloss overlay for a premium finish */}
      <div
        className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="select-none font-serif text-white/90"
          style={{ fontSize: "clamp(2.5rem, 12vw, 7rem)", textShadow: "0 4px 30px rgba(0,0,0,0.25)" }}
        >
          {g}
        </span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10" />
    </div>
  );
}
