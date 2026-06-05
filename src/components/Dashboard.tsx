import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check, Droplet, Plus, Minus, Dumbbell, Flame, Sparkles, User as UserIcon, Coffee, UtensilsCrossed, Moon, Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "./AppShell";
import { RecipeModal, RecipeData } from "./RecipeModal";
import { WorkoutPlayer } from "./WorkoutPlayer";
import { WeightChartModal } from "./WeightChartModal";

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

  const meals: RecipeData[] = [
    { 
      id: "breakfast", label: "Desayuno", name: "Avena con frutos rojos", kcal: 320, macros: {p: 12, c: 45, f: 8}, done: !!progress?.breakfast_done,
      ingredients: ["1/2 taza de avena integral", "1 taza de leche de almendras", "1/2 taza de frutos rojos (fresas, arándanos)", "1 cucharada de semillas de chía"],
      instructions: ["Calienta la leche en una pequeña olla.", "Añade la avena y reduce el fuego. Cocina por 5 minutos.", "Sirve en un bol y decora con los frutos rojos y la chía.", "¡Disfruta tu desayuno lleno de energía!"]
    },
    { 
      id: "lunch", label: "Almuerzo", name: "Pollo a la plancha", kcal: 480, macros: {p: 35, c: 40, f: 15}, done: !!progress?.lunch_done,
      ingredients: ["150g de pechuga de pollo", "1/2 taza de quinoa cocida", "1 taza de espinacas frescas", "1 cucharada de aceite de oliva", "Medio aguacate"],
      instructions: ["Sazona el pollo con sal, pimienta y ajo en polvo.", "Cocina el pollo a la plancha por 6-8 minutos de cada lado.", "Sirve sobre una cama de quinoa y espinacas.", "Añade el aguacate en rodajas y rocía con aceite de oliva."]
    },
    { 
      id: "dinner", label: "Cena", name: "Tortilla de espinacas", kcal: 350, macros: {p: 20, c: 15, f: 18}, done: !!progress?.dinner_done,
      ingredients: ["2 huevos enteros", "1 clara de huevo", "1 taza de espinacas picadas", "1/4 de cebolla picada", "1 rebanada de queso bajo en grasa"],
      instructions: ["Bate los huevos y la clara en un bol con sal y pimienta.", "Saltea la cebolla y las espinacas en un sartén con un poco de aceite.", "Vierte los huevos sobre los vegetales y cocina a fuego medio.", "Dobla la tortilla, añade el queso y sirve caliente."]
    },
  ];

  const [openRecipeId, setOpenRecipeId] = useState<string | null>(null);
  const [showWorkout, setShowWorkout] = useState(false);
  const [showWeight, setShowWeight] = useState(false);
  const activeRecipe = meals.find(m => m.id === openRecipeId) || null;

  const consumedKcal = meals.filter(m => m.done).reduce((acc, m) => acc + m.kcal, 0);
  const consumedP = meals.filter(m => m.done).reduce((acc, m) => acc + m.macros.p, 0);
  const consumedC = meals.filter(m => m.done).reduce((acc, m) => acc + m.macros.c, 0);
  const consumedF = meals.filter(m => m.done).reduce((acc, m) => acc + m.macros.f, 0);

  // Mock Goals based on user profile or fixed for now
  const goalKcal = 1500;
  const goalP = 110;
  const goalC = 150;
  const goalF = 50;
  const remainingKcal = Math.max(0, goalKcal - consumedKcal);

  // SVG ring (Arise Style)
  const ringSize = 180;
  const ringStroke = 14;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ringCirc - (consumedKcal / goalKcal) * ringCirc;

  return (
    <AppShell>
      {/* HEADER PREMIUM - ARISE STYLE */}
      <header className="bg-background px-6 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-white shadow-sm">
              <span className="text-sm font-bold">{(firstName[0] || "U").toUpperCase()}</span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Día {currentDay}</p>
              <p className="text-base font-bold text-foreground">Hola, {firstName || "amig@"} 👋</p>
            </div>
          </div>
          <Link to="/auth" className="grid h-10 w-10 place-items-center rounded-full border border-border/50 bg-white shadow-sm">
            <UserIcon className="h-4 w-4 text-foreground" />
          </Link>
        </div>

        {/* ARISE CALORIE RING */}
        <div className="mt-8 flex flex-col items-center rounded-[2rem] border border-border/50 bg-white p-6 shadow-float">
          <div className="relative shrink-0" style={{ width: ringSize, height: ringSize }}>
            <svg width={ringSize} height={ringSize} className="-rotate-90">
              <circle cx={ringSize/2} cy={ringSize/2} r={ringRadius} stroke="#F3F4F6" strokeWidth={ringStroke} fill="none" />
              <circle
                cx={ringSize/2} cy={ringSize/2} r={ringRadius}
                stroke="url(#ringGrad)" strokeWidth={ringStroke} fill="none"
                strokeLinecap="round"
                strokeDasharray={ringCirc}
                strokeDashoffset={ringOffset}
                style={{ transition: "stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1)" }}
              />
              <defs>
                <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4F8A5B" />
                  <stop offset="100%" stopColor="#7DBE8A" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">Restantes</p>
              <p className="font-display text-4xl font-extrabold leading-none text-foreground my-1">{remainingKcal}</p>
              <p className="text-[12px] font-semibold text-muted-foreground">kcal</p>
            </div>
          </div>

          <div className="mt-6 flex w-full items-center justify-between text-center text-sm">
             <div>
               <p className="text-[11px] font-bold text-muted-foreground uppercase">Consumido</p>
               <p className="font-bold">{consumedKcal} kcal</p>
             </div>
             <div className="h-8 w-px bg-border/60" />
             <div>
               <p className="text-[11px] font-bold text-muted-foreground uppercase">Objetivo</p>
               <p className="font-bold">{goalKcal} kcal</p>
             </div>
          </div>
        </div>

        {/* MACROS - ARISE STYLE */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <MacroBar label="Proteínas" current={consumedP} max={goalP} color="bg-blue-500" />
          <MacroBar label="Carbos" current={consumedC} max={goalC} color="bg-amber-500" />
          <MacroBar label="Grasas" current={consumedF} max={goalF} color="bg-rose-500" />
        </div>
      </header>

      {/* WEIGHT STATS */}
      <section className="-mt-4 grid grid-cols-3 gap-3 px-6">
        <Stat label="Inicial" value={profile.start_weight ? `${profile.start_weight}` : "—"} unit="kg" />
        <button onClick={() => setShowWeight(true)} className="outline-none active:scale-95 transition-transform text-left">
          <Stat label="Actual" value={profile.current_weight ? `${profile.current_weight}` : "—"} unit="kg" highlight />
        </button>
        <Stat label="Meta" value={profile.goal_weight ? `${profile.goal_weight}` : "—"} unit="kg" />
      </section>
      {lostKg > 0 && (
        <div className="mx-6 mt-4 flex items-center justify-center gap-1.5 rounded-full bg-secondary/15 px-3 py-2 text-xs font-bold text-primary shadow-sm border border-border/40">
          <Flame className="h-4 w-4" /> Has perdido {lostKg.toFixed(1)} kg
        </div>
      )}

      {/* MISSION */}
      <section className="mt-8 px-6">
        <SectionLabel>Misión del día</SectionLabel>
        <button
          onClick={() => upsertProgress.mutate({ mission_done: !progress?.mission_done })}
          className={`relative w-full overflow-hidden rounded-[1.5rem] border p-5 text-left shadow-sm transition active:scale-[0.99] ${
            progress?.mission_done ? "bg-background border-border/50" : "bg-white border-border/50"
          }`}
        >
          {!progress?.mission_done && (
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/5 blur-2xl" />
          )}
          <div className="relative flex items-center gap-4">
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${progress?.mission_done ? "bg-muted text-muted-foreground" : "bg-secondary/15 text-primary"}`}>
              <Sparkles className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <p className={`text-[10px] font-bold uppercase tracking-widest ${progress?.mission_done ? "text-muted-foreground/50" : "text-primary"}`}>Reto IA</p>
              <p className={`text-[15px] font-bold ${progress?.mission_done ? "text-muted-foreground line-through opacity-60" : "text-foreground"}`}>
                No tomar refrescos hoy
              </p>
              <p className={`text-[13px] ${progress?.mission_done ? "text-muted-foreground/50" : "text-muted-foreground"}`}>Sustituye por agua o té sin azúcar</p>
            </div>
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-all ${progress?.mission_done ? "border-primary bg-primary text-white" : "border-border bg-background"}`}>
              {progress?.mission_done && <Check className="h-4 w-4" strokeWidth={3} />}
            </span>
          </div>
        </button>
      </section>

      {/* WATER */}
      <section className="mt-8 px-6">
        <SectionLabel>Hidratación</SectionLabel>
        <div className="rounded-[1.5rem] border border-border/40 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent">
                <Droplet className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[15px] font-bold text-foreground">{water} / {waterGoal} vasos</p>
                <p className="text-[13px] text-muted-foreground">{water * 250} ml de {waterGoal * 250} ml</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => upsertProgress.mutate({ water_glasses: Math.max(0, water - 1) })} className="grid h-10 w-10 place-items-center rounded-full bg-background border border-border text-foreground transition active:scale-95">
                <Minus className="h-4 w-4" />
              </button>
              <button onClick={() => upsertProgress.mutate({ water_glasses: Math.min(waterGoal, water + 1) })} className="grid h-10 w-10 place-items-center rounded-full bg-accent text-white shadow-sm transition active:scale-95">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-5 flex gap-1.5">
            {Array.from({ length: waterGoal }).map((_, i) => (
              <div
                key={i}
                className={`h-10 flex-1 rounded-lg transition-all duration-300 ${i < water ? "bg-accent" : "bg-background border border-border/50"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* EXERCISE */}
      <section className="mt-8 px-6">
        <SectionLabel>Ejercicio</SectionLabel>
        <TaskCard
          icon={<Dumbbell className="h-6 w-6 text-primary" />}
          title="Caminar 20 minutos"
          subtitle="A paso ligero · ~120 kcal"
          done={!!progress?.exercise_done}
          onToggle={() => setShowWorkout(true)}
        />
      </section>

      {/* MEALS */}
      <section className="mt-8 px-6">
        <SectionLabel>Comidas de hoy</SectionLabel>
        <div className="space-y-3">
          {meals.map((m) => (
            <MealCard
              key={m.id}
              label={m.label}
              name={m.name}
              kcal={m.kcal}
              macros={m.macros}
              icon={
                m.id === "breakfast" ? <Coffee className="h-5 w-5" /> :
                m.id === "lunch" ? <UtensilsCrossed className="h-5 w-5" /> :
                <Moon className="h-5 w-5" />
              }
              done={!!m.done}
              onOpen={() => setOpenRecipeId(m.id)}
              onToggle={() => upsertProgress.mutate({ [`${m.id}_done`]: !m.done })}
            />
          ))}
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-white py-4 text-[13px] font-medium text-muted-foreground shadow-sm">
          <Bot className="h-4 w-4 text-primary" /> Recetas personalizadas con IA en breve
        </div>
      </section>

      <div className="h-10" />
      <RecipeModal 
        recipe={activeRecipe} 
        open={!!openRecipeId} 
        onOpenChange={(o) => !o && setOpenRecipeId(null)}
        done={activeRecipe ? !!activeRecipe.done : false}
        onToggle={() => activeRecipe && upsertProgress.mutate({ [`${activeRecipe.id}_done`]: !activeRecipe.done })}
      />
      
      <WorkoutPlayer 
        open={showWorkout} 
        onClose={() => setShowWorkout(false)} 
        onComplete={() => upsertProgress.mutate({ exercise_done: true })} 
      />

      <WeightChartModal
        open={showWeight}
        onClose={() => setShowWeight(false)}
        currentWeight={profile.current_weight}
        startWeight={profile.start_weight}
        goalWeight={profile.goal_weight}
        onSaveWeight={(w) => {
          // Here we would typically update profile.current_weight in the db
          supabase.from("profiles").update({ current_weight: w }).eq("id", userId).then(() => {
            qc.invalidateQueries({ queryKey: ["daily_progress", userId, currentDay] });
            // In a real app we might also invalidate profile queries
          });
        }}
      />
    </AppShell>
  );
}

function Stat({ label, value, unit, highlight = false }: { label: string; value: string; unit?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-[1.5rem] p-4 text-center border border-border/40 shadow-sm ${highlight ? "bg-primary text-white" : "bg-white"}`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? "text-white/80" : "text-muted-foreground"}`}>{label}</p>
      <p className={`mt-1 font-display text-xl font-bold leading-none ${highlight ? "" : "text-foreground"}`}>
        {value}<span className={`ml-0.5 text-xs font-semibold ${highlight ? "text-white/80" : "text-muted-foreground"}`}>{unit}</span>
      </p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 px-1 text-[12px] font-bold uppercase tracking-widest text-muted-foreground">{children}</p>;
}

function TaskCard({
  title, subtitle, done, onToggle, icon,
}: { title: string; subtitle?: string; done: boolean; onToggle: () => void; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-4 rounded-[1.5rem] border border-border/40 bg-white p-5 text-left shadow-sm transition active:scale-[0.99]"
    >
      {icon && (
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-colors ${done ? "bg-background text-muted-foreground" : "bg-secondary/15"}`}>
          {icon}
        </span>
      )}
      <div className="flex-1">
        <p className={`text-[16px] font-bold ${done ? "text-muted-foreground line-through opacity-60" : "text-foreground"}`}>{title}</p>
        {subtitle && <p className={`mt-0.5 text-[13px] ${done ? "text-muted-foreground/60" : "text-muted-foreground"}`}>{subtitle}</p>}
      </div>
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-all ${done ? "border-primary bg-primary text-white" : "border-border bg-background"}`}>
        {done && <Check className="h-4 w-4" strokeWidth={3} />}
      </span>
    </button>
  );
}

function MacroBar({ label, current, max, color }: { label: string; current: number; max: number; color: string }) {
  const pct = Math.min(100, Math.max(0, (current / max) * 100));
  return (
    <div className="rounded-2xl border border-border/40 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-sm font-bold text-foreground">{current}</span>
        <span className="text-[10px] font-medium text-muted-foreground">/ {max}g</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function MealCard({
  label, name, kcal, macros, done, onToggle, onOpen, icon,
}: { label: string; name: string; kcal: number; macros: {p:number, c:number, f:number}; done: boolean; onToggle: () => void; onOpen: () => void; icon: React.ReactNode }) {
  return (
    <div
      onClick={onOpen}
      className="flex w-full items-center gap-4 rounded-[1.5rem] border border-border/40 bg-white p-4 text-left shadow-sm transition active:scale-[0.99] cursor-pointer"
    >
      <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl transition-colors ${done ? "bg-background text-muted-foreground" : "bg-secondary/15 text-primary"}`}>
        {icon}
      </span>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
          <span className={`text-[11px] font-bold ${done ? "text-muted-foreground opacity-50" : "text-primary"}`}>{kcal} kcal</span>
        </div>
        <p className={`mt-0.5 text-[15px] font-bold leading-snug ${done ? "line-through opacity-50 text-muted-foreground" : "text-foreground"}`}>{name}</p>
        <div className={`mt-1.5 flex gap-2 text-[11px] font-medium ${done ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
          <span><strong className={done ? "" : "text-blue-500"}>{macros.p}g</strong> P</span>
          <span><strong className={done ? "" : "text-amber-500"}>{macros.c}g</strong> C</span>
          <span><strong className={done ? "" : "text-rose-500"}>{macros.f}g</strong> G</span>
        </div>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className={`ml-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-all ${done ? "border-primary bg-primary text-white" : "border-border bg-background"}`}
      >
        {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </button>
    </div>
  );
}
