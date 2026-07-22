import { AdminPlaceholder } from "@/components/admin/AdminPlaceholder";

export default function Page() {
  return (
    <AdminPlaceholder
      title="Categorías"
      description="Administra la taxonomía: categorías, subcategorías, colores e iconos."
      features={["Crear categorías y subcategorías", "Reordenar (drag & drop)", "Color e icono por vertical", "SEO por categoría", "Fusionar y archivar"]}
    />
  );
}
