import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Sparkles } from "lucide-react";

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
