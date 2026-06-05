import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check, Droplet, Plus, Minus, Dumbbell, Target, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "./AppShell";

type Profile = {
  display_name: string | null;
  start_weight: number | null;
  current_weight: number | null;
  goal_weight: number | null;
  plan_started_at: string | null;
};

export function Dashboard({ userId, profile }: { userId: string; profile: Profile }) {
  const qc = useQueryClient();

  const currentDay = useMemo(() => {
    if (!profile.plan_started_at) return 1;
    const start = new Date(profile.plan_started_at);
    const today = new Date();
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(21, Math.max(1, diff + 1));
  }, [profile.plan_started_at]);

  const { data: progress } = useQuery({
    queryKey: ["daily_progress", userId, currentDay],
    queryFn: async () => {
      const { data } = await supabase
        .from("daily_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("day_number", currentDay)
        .maybeSingle();
      return data;
    },
  });

  const upsertProgress = useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const { error } = await supabase.from("daily_progress").upsert(
        {
          user_id: userId,
          day_number: currentDay,
          log_date: new Date().toISOString().slice(0, 10),
          mission_done: progress?.mission_done ?? false,
          exercise_done: progress?.exercise_done ?? false,
          breakfast_done: progress?.breakfast_done ?? false,
          lunch_done: progress?.lunch_done ?? false,
          dinner_done: progress?.dinner_done ?? false,
          water_glasses: progress?.water_glasses ?? 0,
          ...patch,
        },
        { onConflict: "user_id,day_number" },
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["daily_progress", userId, currentDay] }),
  });

  const waterGoal = 8;
  const water = progress?.water_glasses ?? 0;
  const completedCount = [
    progress?.mission_done,
    progress?.exercise_done,
    progress?.breakfast_done,
    progress?.lunch_done,
    progress?.dinner_done,
  ].filter(Boolean).length;
  const totalTasks = 5;
  const dayProgressPct = Math.round((completedCount / totalTasks) * 100);

  const lostKg =
    profile.start_weight && profile.current_weight
      ? Math.max(0, profile.start_weight - profile.current_weight)
      : 0;

  return (
    <AppShell>
      <header className="px-5 pt-10 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Hola{profile.display_name ? `, ${profile.display_name.split(" ")[0]}` : ""}
            </p>
            <h1 className="mt-1 font-display text-3xl text-foreground">
              Día <span className="text-primary">{currentDay}</span>{" "}
              <span className="text-muted-foreground">de 21</span>
            </h1>
          </div>
          <Link to="/auth" className="grid h-10 w-10 place-items-center rounded-full bg-card shadow-soft">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>

        <div className="mt-5 rounded-2xl bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">Progreso del día</span>
            <span className="text-muted-foreground">{completedCount}/{totalTasks} tareas</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${dayProgressPct}%` }}
            />
          </div>
        </div>
      </header>

      <section className="mt-4 grid grid-cols-3 gap-2 px-5">
        <Stat label="Inicial" value={profile.start_weight ? `${profile.start_weight}kg` : "—"} />
        <Stat label="Actual" value={profile.current_weight ? `${profile.current_weight}kg` : "—"} highlight />
        <Stat label="Meta" value={profile.goal_weight ? `${profile.goal_weight}kg` : "—"} />
      </section>
      {lostKg > 0 && (
        <p className="mt-3 px-5 text-center text-xs text-primary">
          🎉 Has perdido {lostKg.toFixed(1)} kg
        </p>
      )}

      <section className="mt-6 px-5">
        <SectionLabel>Misión del día</SectionLabel>
        <TaskCard
          title="🚫 No tomar refrescos hoy"
          subtitle="Sustituye por agua o té sin azúcar."
          done={!!progress?.mission_done}
          onToggle={() => upsertProgress.mutate({ mission_done: !progress?.mission_done })}
        />
      </section>

      <section className="mt-6 px-5">
        <SectionLabel>Agua</SectionLabel>
        <div className="rounded-3xl bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{water} / {waterGoal} vasos</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => upsertProgress.mutate({ water_glasses: Math.max(0, water - 1) })}
                className="grid h-9 w-9 place-items-center rounded-full bg-muted text-foreground"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                onClick={() => upsertProgress.mutate({ water_glasses: Math.min(waterGoal, water + 1) })}
                className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-4 flex gap-1">
            {Array.from({ length: waterGoal }).map((_, i) => (
              <div
                key={i}
                className={`h-8 flex-1 rounded-lg transition ${i < water ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 px-5">
        <SectionLabel>Ejercicio</SectionLabel>
        <TaskCard
          icon={<Dumbbell className="h-5 w-5" />}
          title="🚶 Caminar 20 minutos"
          subtitle="A paso ligero, al aire libre si puedes."
          done={!!progress?.exercise_done}
          onToggle={() => upsertProgress.mutate({ exercise_done: !progress?.exercise_done })}
        />
      </section>

      <section className="mt-6 px-5">
        <SectionLabel>Comidas de hoy</SectionLabel>
        <div className="space-y-2">
          <MealCard
            label="Desayuno"
            name="Avena con frutos rojos"
            kcal={320}
            done={!!progress?.breakfast_done}
            onToggle={() => upsertProgress.mutate({ breakfast_done: !progress?.breakfast_done })}
          />
          <MealCard
            label="Almuerzo"
            name="Pollo a la plancha con ensalada"
            kcal={480}
            done={!!progress?.lunch_done}
            onToggle={() => upsertProgress.mutate({ lunch_done: !progress?.lunch_done })}
          />
          <MealCard
            label="Cena"
            name="Tortilla de espinacas"
            kcal={350}
            done={!!progress?.dinner_done}
            onToggle={() => upsertProgress.mutate({ dinner_done: !progress?.dinner_done })}
          />
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Las recetas personalizadas con IA llegan en la próxima fase ✨
        </p>
      </section>

      <div className="h-10" />
    </AppShell>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-3 text-center shadow-soft ${highlight ? "bg-primary text-primary-foreground" : "bg-card"}`}>
      <p className={`text-[10px] uppercase tracking-widest ${highlight ? "opacity-80" : "text-muted-foreground"}`}>{label}</p>
      <p className="mt-1 font-display text-lg">{value}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{children}</p>;
}

function TaskCard({
  title,
  subtitle,
  done,
  onToggle,
  icon,
}: {
  title: string;
  subtitle?: string;
  done: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex w-full items-center gap-3 rounded-3xl p-4 text-left shadow-soft transition active:scale-[0.99] ${
        done ? "border border-primary/20 bg-primary/5" : "bg-card"
      }`}
    >
      {icon && (
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-accent text-primary">
          {icon}
        </span>
      )}
      <div className="flex-1">
        <p className={`text-sm font-semibold ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition ${
          done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
        }`}
      >
        {done && <Check className="h-4 w-4" strokeWidth={3} />}
      </span>
    </button>
  );
}

function MealCard({
  label,
  name,
  kcal,
  done,
  onToggle,
}: {
  label: string;
  name: string;
  kcal: number;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left shadow-soft transition active:scale-[0.99] ${
        done ? "border border-primary/20 bg-primary/5" : "bg-card"
      }`}
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent to-secondary text-primary">
        <Target className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium ${done ? "line-through opacity-60" : "text-foreground"}`}>{name}</p>
        <p className="text-[11px] text-muted-foreground">{kcal} kcal</p>
      </div>
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition ${
          done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
        }`}
      >
        {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
    </button>
  );
}
