import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Lock, Sparkles, Calendar } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { PROGRAM_DAYS } from "@/data/program";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/programa")({
  head: () => ({
    meta: [
      { title: "Programa de 21 Días — Tés y Hábitos Saludables" },
      { name: "description", content: "Sigue tu programa estructurado de 21 días para perder peso con tés y hábitos saludables." },
    ],
  }),
  component: ProgramaPage,
});

function ProgramaPage() {
  const { data: progress } = useQuery({
    queryKey: ["day_progress"],
    queryFn: async () => {
      const { data, error } = await supabase.from("day_progress").select("day_number, completed");
      if (error) throw error;
      return data;
    },
  });

  const completed = new Set(progress?.filter((p) => p.completed).map((p) => p.day_number));
  const currentDay = Math.min(21, (completed.size || 0) + 1);
  const pct = Math.round((completed.size / 21) * 100);

  return (
    <AppShell>
      <PageHeader title="Programa 21 Días" subtitle="Tu camino estructurado hacia el bienestar" />

      <section className="px-5">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-sage-deep p-5 text-primary-foreground shadow-float">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-80">Día actual</p>
              <p className="mt-1 font-display text-4xl">{currentDay} / 21</p>
            </div>
            <Sparkles className="h-6 w-6 opacity-90" />
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-background/20">
            <div className="h-full bg-background transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs opacity-90">{completed.size} días completados · {pct}%</p>
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl">
          <Calendar className="h-5 w-5 text-primary" /> Los 21 días
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {PROGRAM_DAYS.map((d) => {
            const done = completed.has(d.day);
            const locked = d.day > currentDay;
            return (
              <Link
                key={d.day}
                to="/_authenticated/programa/$dia"
                params={{ dia: String(d.day) }}
                className={`group relative aspect-square overflow-hidden rounded-2xl p-3 text-left shadow-soft transition active:scale-95 ${
                  done ? "bg-primary text-primary-foreground" : locked ? "bg-muted/50" : "bg-card"
                }`}
              >
                <span className="text-[10px] uppercase opacity-70">Día</span>
                <p className="font-display text-2xl leading-none">{d.day}</p>
                <span className="absolute bottom-2 right-2 text-lg">{d.tea.emoji}</span>
                {done && <Check className="absolute right-2 top-2 h-4 w-4" />}
                {locked && <Lock className="absolute right-2 top-2 h-3 w-3 text-muted-foreground" />}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-6 px-5">
        <Link
          to="/_authenticated/programa/$dia"
          params={{ dia: String(currentDay) }}
          className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-soft"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Continuar</p>
            <p className="font-display text-lg">Día {currentDay} · {PROGRAM_DAYS[currentDay - 1]?.title}</p>
          </div>
          <span className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">Abrir →</span>
        </Link>
      </section>
    </AppShell>
  );
}
