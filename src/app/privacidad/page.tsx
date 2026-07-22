import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageShell } from "@/components/layout/PageShell";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Política de privacidad",
  description: "Cómo tratamos tus datos personales en HyperNews.",
  path: "/privacidad",
});

export default function PrivacyPage() {
  return (
    <PageShell title="Política de privacidad" intro="Tu privacidad nos importa. Aquí te explicamos, en lenguaje claro, cómo tratamos tus datos.">
      <h2>Qué datos recogemos</h2>
      <p>Solo recogemos los datos que nos facilitas voluntariamente, como tu correo electrónico si te suscribes a nuestro boletín. No vendemos ni cedemos tus datos a terceros.</p>
      <h2>Para qué los usamos</h2>
      <ul>
        <li>Enviarte el boletín al que te has suscrito.</li>
        <li>Responder a tus mensajes de contacto.</li>
        <li>Entender de forma agregada y anónima cómo se usa el sitio para mejorarlo.</li>
      </ul>
      <h2>Cookies y publicidad</h2>
      <p>Utilizamos cookies técnicas para el funcionamiento del sitio y, en su caso, cookies de terceros para métricas y publicidad. Puedes gestionar tus preferencias desde tu navegador.</p>
      <h2>Tus derechos</h2>
      <p>Puedes solicitar en cualquier momento el acceso, la rectificación o la eliminación de tus datos escribiéndonos a <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
      <h2>Baja del boletín</h2>
      <p>Cada correo incluye un enlace para darte de baja con un solo clic. Sin preguntas.</p>
    </PageShell>
  );
}
