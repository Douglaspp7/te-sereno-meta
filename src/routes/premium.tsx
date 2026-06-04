import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Lock, Check } from "lucide-react";

export const Route = createFileRoute("/premium")({
  head: () => ({ meta: [{ title: "Plan Premium — Tés para Bajar de Peso" }] }),
  component: Premium,
});

const FEATURES = [
  { title: "Plan de 21 días", desc: "Calendario completo con tés y horarios para una transformación real." },
  { title: "Recetas exclusivas", desc: "Más de 50 mezclas avanzadas que no encontrarás en la app gratuita." },
  { title: "Lista de compras", desc: "Genera tu lista semanal de hierbas e ingredientes con un toque." },
  { title: "Calendario de consumo", desc: "Recordatorios inteligentes adaptados a tu ritmo de vida." },
  { title: "Consejos de alimentación", desc: "Combina tus tés con menús saludables creados por nutricionistas." },
];

function Premium() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-16">
      <div className="relative bg-gradient-to-br from-primary to-sage-deep px-5 pb-12 pt-6 text-primary-foreground">
        <Link to="/" className="grid h-10 w-10 place-items-center rounded-full bg-background/15 backdrop-blur">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.3em] opacity-80">
          <Sparkles className="h-4 w-4" /> Plan Premium
        </div>
        <h1 className="mt-3 font-display text-4xl leading-tight">
          21 días para transformar tu rutina de bienestar
        </h1>
        <p className="mt-3 text-sm opacity-90">
          Accede a recetas exclusivas, calendario personalizado y todas las herramientas para alcanzar tu meta.
        </p>
      </div>

      <div className="-mt-8 relative px-5">
        <div className="rounded-3xl bg-card p-5 shadow-float">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl text-foreground">€9,99</span>
            <span className="text-sm text-muted-foreground">/ mes</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Cancela cuando quieras · 7 días de prueba</p>
          <button className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-medium text-primary-foreground shadow-soft transition active:scale-[0.98]">
            <Sparkles className="h-4 w-4" /> Desbloquear Premium
          </button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">Demo visual — sin cobro real</p>
        </div>
      </div>

      <section className="mt-8 px-5">
        <h2 className="mb-3 font-display text-xl">Qué incluye</h2>
        <ul className="space-y-3">
          {FEATURES.map((f) => (
            <li key={f.title} className="flex gap-3 rounded-2xl bg-card p-4 shadow-soft">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                <Check className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 px-5">
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 21 }).map((_, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-secondary/60 p-2 text-center">
              <span className="text-[10px] uppercase text-muted-foreground">Día</span>
              <p className="font-display text-lg">{i + 1}</p>
              <Lock className="absolute right-1.5 top-1.5 h-3 w-3 text-muted-foreground" />
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 px-5 text-center">
        <Link to="/" className="text-sm text-muted-foreground underline">Volver al inicio</Link>
      </div>
    </div>
  );
}
