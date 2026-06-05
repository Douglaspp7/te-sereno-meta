import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Coffee, UtensilsCrossed, Moon, Dumbbell } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useUser } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { getDayContent } from "@/lib/content/days";
import { RecipeModal, RecipeData } from "@/components/RecipeModal";
import { WorkoutPlayer } from "@/components/WorkoutPlayer";

export const Route = createFileRoute("/_authenticated/alimentacion")({
  component: AlimentacionPage,
});

function AlimentacionPage() {
  const { user } = useUser();
  const userId = user!.id;
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      return data;
    },
  });

  const currentDay = useMemo(() => {
    if (!profile?.plan_started_at) return 1;
    const start = new Date(profile.plan_started_at);
    const today = new Date();
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(21, Math.max(1, diff + 1));
  }, [profile?.plan_started_at]);

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
    enabled: !!profile,
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

  const dayContent = getDayContent(currentDay);
  const meals: RecipeData[] = [
    { ...dayContent.breakfast, id: "breakfast", done: !!progress?.breakfast_done },
    { ...dayContent.lunch, id: "lunch", done: !!progress?.lunch_done },
    { ...dayContent.dinner, id: "dinner", done: !!progress?.dinner_done },
  ];
  const [openId, setOpenId] = useState<string | null>(null);
  const [showWorkout, setShowWorkout] = useState(false);
  const activeRecipe = meals.find(m => m.id === openId) || null;

  const totalKcal = meals.reduce((a, m) => a + m.kcal, 0);
  const consumedKcal = meals.filter(m => m.done).reduce((a, m) => a + m.kcal, 0);

  return (
    <AppShell>
      <header className="px-5 pt-10 pb-2 flex items-center gap-3">
        <Link to="/" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Día {currentDay}</p>
          <h1 className="font-display text-2xl font-bold">Alimentación</h1>
        </div>
      </header>

      <section className="px-5 mt-3">
        <div className="rounded-[1.5rem] bg-white border border-border/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Calorías hoy</p>
              <p className="font-display text-2xl font-bold">{consumedKcal} <span className="text-sm text-muted-foreground font-medium">/ {totalKcal} kcal</span></p>
            </div>
            <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold text-primary">
              {Math.round((consumedKcal/Math.max(1,totalKcal))*100)}%
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all duration-700" style={{ width: `${(consumedKcal/Math.max(1,totalKcal))*100}%` }} />
          </div>
        </div>
      </section>

      <section className="px-5 mt-5 space-y-3">
        {meals.map((m) => (
          <MealRow
            key={m.id}
            meal={m}
            icon={m.id === "breakfast" ? <Coffee className="h-5 w-5"/> : m.id === "lunch" ? <UtensilsCrossed className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}
            onOpen={() => setOpenId(m.id)}
            onToggle={() => upsertProgress.mutate({ [`${m.id}_done`]: !m.done })}
          />
        ))}
      </section>

      <section className="px-5 mt-6">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-widest text-muted-foreground">Ejercicio del día</p>
        <button
          onClick={() => setShowWorkout(true)}
          className="flex w-full items-center gap-4 rounded-[1.5rem] border border-border/50 bg-white p-5 text-left shadow-sm transition active:scale-[0.99]"
        >
          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${progress?.exercise_done ? "bg-muted text-muted-foreground" : "bg-accent/10 text-accent"}`}>
            <Dumbbell className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <p className={`text-[15px] font-bold ${progress?.exercise_done ? "line-through opacity-60 text-muted-foreground" : "text-foreground"}`}>{dayContent.exercise.title}</p>
            <p className="text-[12px] text-muted-foreground">{dayContent.exercise.level} · ~{dayContent.exercise.kcalBurn} kcal</p>
          </div>
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 ${progress?.exercise_done ? "border-primary bg-primary text-white" : "border-border bg-background"}`}>
            {progress?.exercise_done && <Check className="h-4 w-4" strokeWidth={3} />}
          </span>
        </button>
      </section>

      <div className="h-10" />

      <RecipeModal
        recipe={activeRecipe}
        open={!!openId}
        onOpenChange={(o) => !o && setOpenId(null)}
        done={activeRecipe ? !!activeRecipe.done : false}
        onToggle={() => activeRecipe && upsertProgress.mutate({ [`${activeRecipe.id}_done`]: !activeRecipe.done })}
      />
      <WorkoutPlayer open={showWorkout} onClose={() => setShowWorkout(false)} onComplete={() => upsertProgress.mutate({ exercise_done: true })} />
    </AppShell>
  );
}

function MealRow({ meal, icon, onOpen, onToggle }: { meal: RecipeData; icon: React.ReactNode; onOpen: () => void; onToggle: () => void }) {
  return (
    <div onClick={onOpen} className="flex w-full items-center gap-4 rounded-[1.5rem] border border-border/50 bg-white p-4 shadow-sm transition active:scale-[0.99] cursor-pointer">
      <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${meal.done ? "bg-muted text-muted-foreground" : "bg-secondary/15 text-primary"}`}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{meal.label}</p>
          <span className="text-[11px] font-bold text-primary">{meal.kcal} kcal</span>
        </div>
        <p className={`mt-0.5 text-[15px] font-bold leading-snug truncate ${meal.done ? "line-through opacity-50 text-muted-foreground" : "text-foreground"}`}>{meal.name}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className={`ml-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 ${meal.done ? "border-primary bg-primary text-white" : "border-border bg-background"}`}
      >
        {meal.done && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>
    </div>
  );
}
