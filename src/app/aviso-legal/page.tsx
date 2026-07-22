import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageShell } from "@/components/layout/PageShell";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Aviso legal",
  description: "Información legal y condiciones de uso de HyperNews.",
  path: "/aviso-legal",
});

export default function LegalPage() {
  return (
    <PageShell title="Aviso legal" intro="Condiciones generales de uso del sitio web HyperNews.">
      <h2>Titularidad</h2>
      <p>Este sitio web es un proyecto editorial. El acceso y uso del sitio implica la aceptación de las presentes condiciones.</p>
      <h2>Propiedad intelectual</h2>
      <p>Los contenidos originales publicados en HyperNews están protegidos por derechos de propiedad intelectual. Las imágenes de terceros se utilizan bajo sus respectivas licencias. Puedes citar y enlazar nuestros artículos indicando la fuente.</p>
      <h2>Responsabilidad</h2>
      <p>La información publicada tiene carácter divulgativo y no constituye asesoramiento profesional (médico, psicológico, financiero o legal). HyperNews no se responsabiliza de las decisiones tomadas a partir de sus contenidos.</p>
      <h2>Enlaces externos</h2>
      <p>El sitio puede incluir enlaces a páginas de terceros. No nos hacemos responsables del contenido ni de las políticas de dichos sitios.</p>
      <h2>Contacto</h2>
      <p>Para cualquier cuestión legal, escríbenos a <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
    </PageShell>
  );
}
