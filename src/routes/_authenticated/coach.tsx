import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { ComingSoon } from "./plan";

export const Route = createFileRoute("/_authenticated/coach")({
  component: CoachPage,
});

function CoachPage() {
  return (
    <AppShell>
      <PageHeader title="AI Coach" subtitle="Acciones rápidas con IA." />
      <div className="px-5">
        <ComingSoon
          title="Cambiar comida, ejercicio o pedir ayuda"
          desc="Botones rápidos para adaptar tu plan o resolver dudas en segundos."
        />
      </div>
    </AppShell>
  );
}
