import Link from "next/link";

/** Consistent section header with an eyebrow, title and optional "see all" link. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  hrefLabel = "Ver todo",
  accent,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
  accent?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
      <div>
        {eyebrow && (
          <p
            className="mb-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ color: accent ?? "var(--accent)" }}
          >
            {eyebrow}
          </p>
        )}
        <h2 className="font-serif text-2xl font-medium leading-tight md:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-xl text-muted">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="group hidden shrink-0 items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-fg sm:flex"
        >
          {hrefLabel}
          <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}
