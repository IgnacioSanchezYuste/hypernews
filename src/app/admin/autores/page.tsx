import { AdminPlaceholder } from "@/components/admin/AdminPlaceholder";

export default function Page() {
  return (
    <AdminPlaceholder
      title="Autores"
      description="Gestiona el equipo editorial, sus perfiles y permisos."
      features={["Perfiles de autor", "Biografía y redes sociales", "Roles y permisos", "Rendimiento por autor", "Foto de perfil"]}
    />
  );
}
