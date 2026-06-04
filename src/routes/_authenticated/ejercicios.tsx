import { createFileRoute, Link } from "@tanstack/react-router";
import { Dumbbell, HeartPulse, Footprints, Sparkles, Construction } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/ejercicios")({
  head: () => ({
    meta: [
      { title: "Ejercicios — Reset 21" },
      { name: "description", content: "Rutinas de ejercicio de 21 días: cardio, fuerza, movilidad y mindfulness." },
    ],
  }),
  component: EjerciciosPage,
});

const blocks = [
  { icon: Footprints, label: "Cardio suave", desc: "Caminatas y aeróbico ligero" },
  { icon: Dumbbell, label: "Fuerza en casa", desc: "Sin equipo, 15–20 min" },
  { icon: HeartPulse, label: "Movilidad", desc: "Estiramientos y postura" },
  { icon: Sparkles, label: "Respiración", desc: "Calma y recuperación" },
];

function EjerciciosPage() {
  return (
    <AppShell>
      <PageHeader title="Ejercicios" subtitle="Movimiento diario, sin gimnasio" />

      <section className="px-5 grid grid-cols-2 gap-3">
        {blocks.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.label} className="rounded-2xl bg-card p-4 shadow-soft">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 font-display text-lg">{b.label}</p>
              <p className="text-xs text-muted-foreground">{b.desc}</p>
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
              Pronto verás las rutinas día a día con videos, duración y progresión semanal.
            </p>
            <Link to="/_authenticated/programa" className="mt-3 inline-block text-primary">Ver programa de 21 días →</Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
