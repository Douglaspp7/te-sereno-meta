import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Quote, ChevronRight, Sparkles } from "lucide-react";
import { getProgramDay, PROGRAM_DAYS } from "@/data/program";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/programa/$dia")({
  head: ({ params }) => ({
    meta: [{ title: `Día ${params.dia} — Programa 21 Días` }],
  }),
  component: DiaPage,
});

function DiaPage() {
  const { dia } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const dayNumber = parseInt(dia, 10);
  const day = getProgramDay(dayNumber);

  const { data: progressRow } = useQuery({
    queryKey: ["day_progress", dayNumber],
    queryFn: async () => {
      const { data } = await supabase
        .from("day_progress")
        .select("*")
        .eq("day_number", dayNumber)
        .maybeSingle();
      return data;
    },
    enabled: !!day,
  });

  const [checks, setChecks] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (progressRow?.checklist) setChecks(progressRow.checklist as Record<string, boolean>);
  }, [progressRow]);

  if (!day) {
    return (
      <div className="p-8 text-center">
        <p>Día no encontrado.</p>
        <Link to="/_authenticated/programa" className="text-primary">Volver al programa</Link>
      </div>
    );
  }

  const total = day.checklist.length;
  const done = day.checklist.filter((c) => checks[c.id]).length;
  const allDone = done === total;

  const toggle = async (id: string) => {
    const next = { ...checks, [id]: !checks[id] };
    setChecks(next);
    const completed = day.checklist.every((c) => next[c.id]);
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    await supabase.from("day_progress").upsert(
      {
        user_id: user.user.id,
        day_number: dayNumber,
        checklist: next,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,day_number" },
    );
    if (completed && !progressRow?.completed) {
      // award points
      const { data: profile } = await supabase.from("profiles").select("points").single();
      await supabase
        .from("profiles")
        .update({ points: (profile?.points ?? 0) + 50 })
        .eq("id", user.user.id);
      toast.success(`¡Día ${dayNumber} completado! +50 puntos 🌿`);
    }
    qc.invalidateQueries({ queryKey: ["day_progress"] });
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  const nextDay = dayNumber < 21 ? dayNumber + 1 : null;

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-12">
      <header className="relative bg-gradient-to-br from-primary to-sage-deep px-5 pb-10 pt-6 text-primary-foreground">
        <button
          onClick={() => navigate({ to: "/_authenticated/programa" })}
          className="grid h-10 w-10 place-items-center rounded-full bg-background/15 backdrop-blur"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <p className="mt-6 text-xs uppercase tracking-[0.3em] opacity-80">Día {day.day} de 21</p>
        <h1 className="mt-2 font-display text-3xl leading-tight">{day.title}</h1>
        <p className="mt-3 text-sm opacity-90">{day.objective}</p>
      </header>

      <section className="-mt-6 px-5">
        <div className="rounded-3xl bg-card p-5 shadow-float">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Té recomendado</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-2xl">{day.tea.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg leading-tight">{day.tea.name}</p>
              {day.tea.recipeId && (
                <Link
                  to="/recetas/$id"
                  params={{ id: day.tea.recipeId }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary"
                >
                  Ver preparación <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 px-5">
        <h2 className="font-display text-lg">Hábito del día</h2>
        <div className="mt-2 rounded-2xl bg-secondary/50 p-4 text-sm">{day.habit}</div>
      </section>

      <section className="mt-5 px-5">
        <h2 className="mb-2 flex items-center justify-between font-display text-lg">
          Checklist
          <span className="text-xs font-normal text-muted-foreground">{done}/{total}</span>
        </h2>
        <ul className="space-y-2">
          {day.checklist.map((c) => {
            const v = !!checks[c.id];
            return (
              <li key={c.id}>
                <button
                  onClick={() => toggle(c.id)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-soft"
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition ${
                      v ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {v && <Check className="h-4 w-4" />}
                  </span>
                  <span className={`text-sm ${v ? "text-muted-foreground line-through" : ""}`}>{c.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-5 px-5">
        <div className="rounded-2xl border border-primary/30 bg-accent/30 p-4">
          <Quote className="h-4 w-4 text-primary" />
          <p className="mt-2 font-display italic leading-snug">{day.tip}</p>
        </div>
      </section>

      {allDone && (
        <section className="mt-6 px-5">
          <div className="rounded-2xl bg-primary p-5 text-center text-primary-foreground shadow-float">
            <Sparkles className="mx-auto h-6 w-6" />
            <p className="mt-2 font-display text-lg">¡Día completado!</p>
            {nextDay ? (
              <Link
                to="/_authenticated/programa/$dia"
                params={{ dia: String(nextDay) }}
                className="mt-3 inline-block rounded-full bg-background px-4 py-2 text-sm font-medium text-foreground"
              >
                Continuar al día {nextDay} →
              </Link>
            ) : (
              <p className="mt-2 text-sm opacity-90">Has completado los 21 días. ¡Felicidades!</p>
            )}
          </div>
        </section>
      )}

      <nav className="mt-8 flex items-center justify-between px-5 text-sm">
        {dayNumber > 1 ? (
          <Link to="/_authenticated/programa/$dia" params={{ dia: String(dayNumber - 1) }} className="text-muted-foreground">
            ← Día {dayNumber - 1}
          </Link>
        ) : <span />}
        {nextDay && (
          <Link to="/_authenticated/programa/$dia" params={{ dia: String(nextDay) }} className="text-primary">
            Día {nextDay} →
          </Link>
        )}
      </nav>

      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        {PROGRAM_DAYS.length} días · 21 etapas hacia tu bienestar
      </p>
    </div>
  );
}
