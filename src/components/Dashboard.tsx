import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check, Droplet, Plus, Minus, Dumbbell, Flame, Sparkles, User as UserIcon, Coffee, UtensilsCrossed, Moon } from "lucide-react";
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
  const planProgressPct = Math.round((currentDay / 21) * 100);

  const lostKg =
    profile.start_weight && profile.current_weight
      ? Math.max(0, profile.start_weight - profile.current_weight)
      : 0;

  const firstName = profile.display_name?.split(" ")[0] ?? "";

  // SVG ring
  const ringSize = 96;
  const ringStroke = 9;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ringCirc - (dayProgressPct / 100) * ringCirc;

  return (
    <AppShell>
      {/* HEADER */}
      <header className="gradient-hero px-5 pt-10 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full gradient-ai text-white shadow-soft">
              <span className="text-sm font-bold">{(firstName[0] || "U").toUpperCase()}</span>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Hola{firstName ? `,` : ""}</p>
              <p className="text-sm font-semibold text-foreground">{firstName || "amig@"} 👋</p>
            </div>
          </div>
          <Link to="/auth" className="grid h-10 w-10 place-items-center rounded-full bg-card shadow-soft">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>

        {/* Day ring + plan stat */}
        <div className="mt-6 flex items-center gap-4 rounded-3xl bg-card p-4 shadow-float">
          <div className="relative shrink-0" style={{ width: ringSize, height: ringSize }}>
            <svg width={ringSize} height={ringSize} className="-rotate-90">
              <circle cx={ringSize/2} cy={ringSize/2} r={ringRadius} stroke="oklch(0.94 0.01 150)" strokeWidth={ringStroke} fill="none" />
              <circle
                cx={ringSize/2} cy={ringSize/2} r={ringRadius}
                stroke="url(#ringGrad)" strokeWidth={ringStroke} fill="none"
                strokeLinecap="round"
                strokeDasharray={ringCirc}
                strokeDashoffset={ringOffset}
                style={{ transition: "stroke-dashoffset 600ms ease" }}
              />
              <defs>
                <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="oklch(0.56 0.1 150)" />
                  <stop offset="100%" stopColor="oklch(0.5 0.12 200)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="font-display text-2xl leading-none text-foreground">{currentDay}</p>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">de 21</p>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Tu reto</p>
            <p className="font-display text-lg text-foreground">{completedCount}/{totalTasks} tareas hoy</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full gradient-ai transition-all" style={{ width: `${planProgressPct}%` }} />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">Progreso del programa · {planProgressPct}%</p>
          </div>
        </div>
      </header>

      {/* WEIGHT STATS */}
      <section className="-mt-2 grid grid-cols-3 gap-2 px-5">
        <Stat label="Inicial" value={profile.start_weight ? `${profile.start_weight}` : "—"} unit="kg" />
        <Stat label="Actual" value={profile.current_weight ? `${profile.current_weight}` : "—"} unit="kg" highlight />
        <Stat label="Meta" value={profile.goal_weight ? `${profile.goal_weight}` : "—"} unit="kg" />
      </section>
      {lostKg > 0 && (
        <div className="mx-5 mt-3 flex items-center justify-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-primary">
          <Flame className="h-3.5 w-3.5" /> Has perdido {lostKg.toFixed(1)} kg
        </div>
      )}

      {/* MISSION */}
      <section className="mt-7 px-5">
        <SectionLabel>Misión del día</SectionLabel>
        <button
          onClick={() => upsertProgress.mutate({ mission_done: !progress?.mission_done })}
          className={`relative w-full overflow-hidden rounded-3xl p-5 text-left shadow-float transition active:scale-[0.99] ${
            progress?.mission_done ? "bg-card" : "gradient-ai text-white"
          }`}
        >
          {!progress?.mission_done && (
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
          )}
          <div className="relative flex items-center gap-4">
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${progress?.mission_done ? "bg-accent text-primary" : "bg-white/20 text-white"}`}>
              <Sparkles className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <p className={`text-[10px] font-semibold uppercase tracking-widest ${progress?.mission_done ? "text-muted-foreground" : "text-white/80"}`}>Reto IA</p>
              <p className={`text-base font-bold ${progress?.mission_done ? "text-foreground line-through opacity-60" : ""}`}>
                No tomar refrescos hoy
              </p>
              <p className={`text-xs ${progress?.mission_done ? "text-muted-foreground" : "text-white/80"}`}>Sustituye por agua o té sin azúcar</p>
            </div>
            <span className={`grid h-9 w-9 place-items-center rounded-full border-2 ${progress?.mission_done ? "border-primary bg-primary text-white" : "border-white/40 bg-white/10"}`}>
              {progress?.mission_done && <Check className="h-4 w-4" strokeWidth={3} />}
            </span>
          </div>
        </button>
      </section>

      {/* WATER */}
      <section className="mt-7 px-5">
        <SectionLabel>Hidratación</SectionLabel>
        <div className="rounded-3xl bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl" style={{ backgroundColor: "oklch(0.65 0.16 250 / 0.12)", color: "oklch(0.55 0.16 250)" }}>
                <Droplet className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">{water} / {waterGoal} vasos</p>
                <p className="text-[11px] text-muted-foreground">{water * 250} ml de {waterGoal * 250} ml</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => upsertProgress.mutate({ water_glasses: Math.max(0, water - 1) })} className="grid h-9 w-9 place-items-center rounded-full bg-muted text-foreground">
                <Minus className="h-4 w-4" />
              </button>
              <button onClick={() => upsertProgress.mutate({ water_glasses: Math.min(waterGoal, water + 1) })} className="grid h-9 w-9 place-items-center rounded-full gradient-ai text-white shadow-soft">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-4 flex gap-1">
            {Array.from({ length: waterGoal }).map((_, i) => (
              <div
                key={i}
                className={`h-9 flex-1 rounded-lg transition ${i < water ? "" : "bg-muted"}`}
                style={i < water ? { background: "linear-gradient(180deg, oklch(0.7 0.16 250 / 0.7), oklch(0.55 0.16 250))" } : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      {/* EXERCISE */}
      <section className="mt-7 px-5">
        <SectionLabel>Ejercicio</SectionLabel>
        <TaskCard
          icon={<Dumbbell className="h-5 w-5" />}
          title="Caminar 20 minutos"
          subtitle="A paso ligero · ~120 kcal"
          done={!!progress?.exercise_done}
          onToggle={() => upsertProgress.mutate({ exercise_done: !progress?.exercise_done })}
        />
      </section>

      {/* MEALS */}
      <section className="mt-7 px-5">
        <SectionLabel>Comidas de hoy</SectionLabel>
        <div className="space-y-2">
          <MealCard label="Desayuno" name="Avena con frutos rojos" kcal={320} icon={<Coffee className="h-5 w-5" />} done={!!progress?.breakfast_done} onToggle={() => upsertProgress.mutate({ breakfast_done: !progress?.breakfast_done })} />
          <MealCard label="Almuerzo" name="Pollo a la plancha con ensalada" kcal={480} icon={<UtensilsCrossed className="h-5 w-5" />} done={!!progress?.lunch_done} onToggle={() => upsertProgress.mutate({ lunch_done: !progress?.lunch_done })} />
          <MealCard label="Cena" name="Tortilla de espinacas" kcal={350} icon={<Moon className="h-5 w-5" />} done={!!progress?.dinner_done} onToggle={() => upsertProgress.mutate({ dinner_done: !progress?.dinner_done })} />
        </div>
        <div className="mt-4 flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border bg-card/50 py-3 text-[11px] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Recetas personalizadas con IA llegan en breve
        </div>
      </section>

      <div className="h-10" />
    </AppShell>
  );
}

function Stat({ label, value, unit, highlight = false }: { label: string; value: string; unit?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-3 text-center shadow-soft ${highlight ? "gradient-ai text-white" : "bg-card"}`}>
      <p className={`text-[9px] uppercase tracking-widest ${highlight ? "opacity-80" : "text-muted-foreground"}`}>{label}</p>
      <p className="mt-1 font-display text-xl leading-none">
        {value}<span className={`ml-0.5 text-[10px] font-medium ${highlight ? "opacity-80" : "text-muted-foreground"}`}>{unit}</span>
      </p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2.5 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{children}</p>;
}

function TaskCard({
  title, subtitle, done, onToggle, icon,
}: { title: string; subtitle?: string; done: boolean; onToggle: () => void; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onToggle}
      className={`flex w-full items-center gap-3 rounded-3xl p-4 text-left shadow-soft transition active:scale-[0.99] ${
        done ? "bg-card" : "bg-card"
      }`}
    >
      {icon && (
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${done ? "bg-muted text-muted-foreground" : "bg-accent text-primary"}`}>
          {icon}
        </span>
      )}
      <div className="flex-1">
        <p className={`text-[15px] font-bold ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition ${done ? "border-primary bg-primary text-white" : "border-border bg-background"}`}>
        {done && <Check className="h-4 w-4" strokeWidth={3} />}
      </span>
    </button>
  );
}

function MealCard({
  label, name, kcal, done, onToggle, icon,
}: { label: string; name: string; kcal: number; done: boolean; onToggle: () => void; icon: React.ReactNode }) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-3 rounded-2xl bg-card p-3.5 text-left shadow-soft transition active:scale-[0.99]"
    >
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${done ? "bg-muted text-muted-foreground" : "bg-accent text-primary"}`}>
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className={`text-sm font-semibold ${done ? "line-through opacity-50" : "text-foreground"}`}>{name}</p>
        <p className="text-[11px] text-muted-foreground">{kcal} kcal</p>
      </div>
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition ${done ? "border-primary bg-primary text-white" : "border-border bg-background"}`}>
        {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
    </button>
  );
}
