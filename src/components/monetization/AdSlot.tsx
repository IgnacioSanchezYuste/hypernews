/**
 * Reserved advertising slot. Renders a labelled placeholder in development and
 * a fixed-height container (no layout shift) ready for AdSense / a direct
 * banner / native ad. Swap the inner markup for your ad script when live.
 */
export function AdSlot({
  format = "leaderboard",
  label = "Publicidad",
}: {
  format?: "leaderboard" | "rectangle" | "inline";
  label?: string;
}) {
  const height = format === "leaderboard" ? "min-h-[90px]" : format === "rectangle" ? "min-h-[250px]" : "min-h-[120px]";
  return (
    <aside
      className={`flex ${height} w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-hair bg-subtle text-center`}
      aria-label={label}
      data-ad-slot={format}
    >
      <div className="text-xs uppercase tracking-widest text-subtle">
        <p>{label}</p>
        <p className="mt-1 text-[10px] normal-case tracking-normal text-subtle/70">Espacio {format} · listo para AdSense</p>
      </div>
    </aside>
  );
}
