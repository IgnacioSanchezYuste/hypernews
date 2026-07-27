import { AdminPlaceholder } from "@/components/admin/AdminPlaceholder";

export default function Page() {
  return (
    <AdminPlaceholder
      title="Configuración"
      description="Ajustes globales del sitio, SEO por defecto e integraciones."
      features={["Identidad y branding", "SEO y metadatos por defecto", "Newsletter y ESP", "Analítica e integraciones", "Redes sociales"]}
    />
  );
}
