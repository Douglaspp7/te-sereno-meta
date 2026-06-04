import { createFileRoute, Link } from "@tanstack/react-router";
import { Apple, Coffee, Soup, Salad, Construction } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/alimentacion")({
  head: () => ({
    meta: [
      { title: "Alimentación — Reset 21" },
      { name: "description", content: "Plan de alimentación de 21 días: desayunos, comidas, cenas y snacks saludables." },
    ],
  }),
  component: AlimentacionPage,
});

const meals = [
  { icon: Coffee, label: "Desayunos", desc: "Empieza el día con energía" },
  { icon: Salad, label: "Comidas", desc: "Platos equilibrados y saciantes" },
  { icon: Soup, label: "Cenas", desc: "Ligeras y nutritivas" },
  { icon: Apple, label: "Snacks", desc: "Picoteo inteligente entre horas" },
];

function AlimentacionPage() {
  return (
    <AppShell>
      <PageHeader title="Alimentación" subtitle="Tu plan de comidas para 21 días" />

      <section className="px-5 grid grid-cols-2 gap-3">
        {meals.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="rounded-2xl bg-card p-4 shadow-soft">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 font-display text-lg">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </div>
          );
        })}
      </section>

      <section className="mt-6 px-5">
        <div className="flex items-start gap-3 rounded-3xl border border-dashed border-border bg-card/50 p-5 shadow-soft">
          <Construction className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Contenido en preparación</p>
            <p className="mt-1">
              Aquí verás tu menú diario con recetas, lista de la compra y sustituciones inteligentes.
            </p>
            <Link to="/recetas" className="mt-3 inline-block text-primary">Mientras tanto, explora las recetas →</Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
