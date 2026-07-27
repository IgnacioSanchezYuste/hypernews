import { AdminPlaceholder } from "@/components/admin/AdminPlaceholder";

export default function Page() {
  return (
    <AdminPlaceholder
      title="Publicidad"
      description="Gestiona la monetización sin dañar la experiencia de usuario."
      features={["Integración con AdSense", "Banners y patrocinios directos", "Publicidad nativa", "Enlaces de afiliado", "Reporte de ingresos"]}
    />
  );
}
