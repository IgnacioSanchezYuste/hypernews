/** Simple, centered text page used for editorial / legal / info pages. */
export function PageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page max-w-3xl py-14 md:py-20">
      <h1 className="font-serif text-4xl font-semibold md:text-5xl">{title}</h1>
      {intro && <p className="mt-4 text-lg text-muted">{intro}</p>}
      <div className="prose-hn mt-8 max-w-none">{children}</div>
    </div>
  );
}
