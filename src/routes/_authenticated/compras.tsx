import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { ComingSoon } from "./plan";

export const Route = createFileRoute("/_authenticated/compras")({
  component: ComprasPage,
});

function ComprasPage() {
  return (
    <AppShell>
      <PageHeader title="Lista de compras" subtitle="Lo que necesitas, por semana." />
      <div className="px-5">
        <ComingSoon
          title="Lista generada por IA"
          desc="Tu lista de ingredientes para las 3 semanas, organizada y marcable."
        />
      </div>
    </AppShell>
  );
}
