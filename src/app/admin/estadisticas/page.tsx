import { AdminPlaceholder } from "@/components/admin/AdminPlaceholder";

export default function Page() {
  return (
    <AdminPlaceholder
      title="Estadísticas"
      description="Analítica de audiencia, contenido y conversión."
      features={["Visitas y usuarios en tiempo real", "Artículos más leídos", "Fuentes de tráfico", "Embudo de newsletter", "Core Web Vitals reales (RUM)"]}
    />
  );
}
