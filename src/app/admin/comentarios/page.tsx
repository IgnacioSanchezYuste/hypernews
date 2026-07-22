import { AdminPlaceholder } from "@/components/admin/AdminPlaceholder";

export default function Page() {
  return (
    <AdminPlaceholder
      title="Comentarios"
      description="Modera la conversación de tu comunidad."
      features={["Cola de moderación", "Aprobar / rechazar", "Filtro anti-spam", "Responder en línea", "Usuarios bloqueados"]}
    />
  );
}
