import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { ComingSoon } from "./plan";

export const Route = createFileRoute("/_authenticated/progreso")({
  component: ProgresoPage,
});

function ProgresoPage() {
  return (
    <AppShell>
      <PageHeader title="Tu progreso" subtitle="Mira cómo evolucionas." />
      <div className="px-5">
        <ComingSoon
          title="Gráficos, fotos y medidas"
          desc="Aquí verás tu evolución de peso, fotos antes/después y medidas corporales."
        />
      </div>
    </AppShell>
  );
}
