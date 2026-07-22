import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageShell } from "@/components/layout/PageShell";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Contacto",
  description: "¿Tienes una sugerencia, una corrección o una propuesta de colaboración? Escríbenos.",
  path: "/contacto",
});

export default function ContactPage() {
  return (
    <PageShell title="Contacto" intro="Nos encanta recibir noticias de nuestros lectores. Sugerencias, correcciones, propuestas: todo cuenta.">
      <p>Puedes escribirnos directamente a <a href={`mailto:${site.email}`}>{site.email}</a> y te responderemos lo antes posible.</p>
      <div className="not-prose mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-hair p-5">
          <h3 className="font-semibold">Redacción</h3>
          <p className="mt-1 text-sm text-muted">Sugerencias de temas y correcciones.</p>
          <a href={`mailto:${site.email}`} className="mt-2 inline-block text-sm font-medium text-brand-600">{site.email}</a>
        </div>
        <div className="rounded-xl border border-hair p-5">
          <h3 className="font-semibold">Publicidad</h3>
          <p className="mt-1 text-sm text-muted">Colaboraciones y espacios patrocinados.</p>
          <a href={`mailto:${site.email}`} className="mt-2 inline-block text-sm font-medium text-brand-600">{site.email}</a>
        </div>
      </div>
    </PageShell>
  );
}
