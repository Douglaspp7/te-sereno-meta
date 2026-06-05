import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/plan")({
  component: PlanPage,
});

function PlanPage() {
  return (
    <AppShell>
      <PageHeader title="Tu plan de 21 días" subtitle="Mira lo que viene." />
      <div className="px-5">
        <ComingSoon
          title="Vista completa del plan"
          desc="Aquí verás los 21 días con la misión, comidas y ejercicio de cada uno."
        />
      </div>
    </AppShell>
  );
}

export function ComingSoon({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mt-4 rounded-3xl border border-dashed border-border bg-card p-8 text-center shadow-soft">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles className="h-6 w-6" />
      </div>
      <h2 className="mt-4 font-display text-xl text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      <p className="mt-4 text-xs text-primary">Próximamente ✨</p>
    </div>
  );
}
