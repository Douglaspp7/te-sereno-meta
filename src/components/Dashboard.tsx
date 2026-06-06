import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check, Sparkles, LogOut, Flame, Target, ChevronRight, Activity, Droplet, Dumbbell, Utensils, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "./AppShell";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Profile = {
  display_name: string | null;
  start_weight: number | null;
  current_weight: number | null;
  goal_weight: number | null;
  plan_started_at: string | null;
  height_cm: number | null;
};

export function Dashboard({ userId, profile }: { userId: string; profile: Profile }) {
  const qc = useQueryClient();
  const [weightInput, setWeightInput] = useState("");
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  const currentDay = useMemo(() => {
    if (!profile.plan_started_at) return 1;
    const start = new Date(profile.plan_started_at);
    const today = new Date();
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(21, Math.max(1, diff + 1));
  }, [profile.plan_started_at]);

  // Fetch all progress for stats and chart
  const { data: allProgress } = useQuery({
    queryKey: ["daily_progress", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("daily_progress")
        .select("*")
        .eq("user_id", userId)
        .order("day_number", { ascending: true });
      return data || [];
    },
  });

  const progress = allProgress?.find(p => p.day_number === currentDay);

  const { data: dayData } = useQuery({
    queryKey: ["day", currentDay],
    queryFn: async () => {
      const { data } = await supabase.from('days').select('*').eq('day_number', currentDay).maybeSingle();
      return data;
    }
  });

  // Mutations
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["daily_progress", userId] }),
  });

  const updateWeight = useMutation({
    mutationFn: async (newWeight: number) => {
      // 1. Update Profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ current_weight: newWeight })
        .eq("id", userId);
      if (profileError) throw profileError;

      // 2. Add to Daily Progress
      const { error: progressError } = await supabase.from("daily_progress").upsert(
        {
          user_id: userId,
          day_number: currentDay,
          log_date: new Date().toISOString().slice(0, 10),
          weight: newWeight,
        },
        { onConflict: "user_id,day_number" }
      );
      if (progressError) throw progressError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["daily_progress", userId] });
      qc.invalidateQueries({ queryKey: ["profile"] }); // Assuming you have a profile query in the router
      setIsWeightModalOpen(false);
      setWeightInput("");
    },
  });

  // Computations
  const planPct = Math.round((currentDay / 21) * 100);
  const firstName = profile.display_name?.split(" ")[0] ?? "Usuario";
  const missionText = dayData?.mission?.replace(/^[^\w\s]+\s/, "") || "Cargando misión...";
  
  const lostKg = profile.start_weight && profile.current_weight
    ? Math.max(0, profile.start_weight - profile.current_weight)
    : 0;
  
  const remainingKg = profile.current_weight && profile.goal_weight
    ? Math.max(0, profile.current_weight - profile.goal_weight)
    : 0;

  // Chart Data preparation
  const chartData = useMemo(() => {
    let data = [];
    if (profile.start_weight) {
      data.push({ name: "Inicio", peso: profile.start_weight });
    }
    if (allProgress) {
      const logs = allProgress.filter(p => p.weight !== null).map(p => ({
        name: `Día ${p.day_number}`,
        peso: p.weight
      }));
      data = [...data, ...logs];
    }
    return data;
  }, [profile.start_weight, allProgress]);

  // BMI (IMC) Calculation
  const imcData = useMemo(() => {
    if (!profile.current_weight || !profile.height_cm) return null;
    const heightM = profile.height_cm / 100;
    const imc = profile.current_weight / (heightM * heightM);
    let label = "";
    let color = "";
    
    if (imc < 18.5) { label = "Bajo Peso"; color = "text-blue-400"; }
    else if (imc >= 18.5 && imc < 24.9) { label = "Peso Normal"; color = "text-green-400"; }
    else if (imc >= 25 && imc < 29.9) { label = "Sobrepeso"; color = "text-orange-400"; }
    else { label = "Obesidad"; color = "text-red-400"; }
    
    return { value: imc.toFixed(1), label, color };
  }, [profile.current_weight, profile.height_cm]);

  // Quick Stats computations
  const stats = useMemo(() => {
    if (!allProgress || allProgress.length === 0) return { streak: 0, water: 0, exercise: 0, meals: 0 };
    
    let streak = 0;
    for (let i = allProgress.length - 1; i >= 0; i--) {
      const p = allProgress[i];
      if (p.mission_done || p.exercise_done || p.breakfast_done) streak++;
      else break;
    }

    const totalDays = 21; // Sempre proporcional a 21 dias totais do desafio
    const waterDays = allProgress.filter(p => (p.water_glasses ?? 0) >= 8).length;
    const exerciseDays = allProgress.filter(p => p.exercise_done).length;
    const mealsDays = allProgress.filter(p => p.breakfast_done && p.lunch_done && p.dinner_done).length;

    return {
      streak,
      water: Math.round((waterDays / totalDays) * 100) || 0,
      exercise: Math.round((exerciseDays / totalDays) * 100) || 0,
      meals: Math.round((mealsDays / totalDays) * 100) || 0,
    };
  }, [allProgress]);

  // Circular Progress values
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (planPct / 100) * circumference;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Calculate Unlocked Rewards for the Recompensas Button
  const unlockedRewardsCount = useMemo(() => {
    if (!allProgress) return 0;
    
    let streak = 0, maxStreak = 0;
    let meals = 0, exercises = 0, teas = 0;
    let prevDay = 0;
    
    for (const p of allProgress) {
      meals += (p.breakfast_done ? 1 : 0) + (p.lunch_done ? 1 : 0) + (p.dinner_done ? 1 : 0);
      if (p.exercise_done) exercises++;
      if ((p.water_glasses || 0) > 0) teas++;

      if (p.mission_done || p.exercise_done || p.breakfast_done || p.lunch_done || p.dinner_done || (p.water_glasses || 0) > 0) {
        if (p.day_number === prevDay + 1 || prevDay === 0) streak++;
        else streak = 1;
        prevDay = p.day_number;
        if (streak > maxStreak) maxStreak = streak;
      } else {
        streak = 0;
      }
    }
    
    const REWARDS = [
      { type: "streak", target: 7 }, { type: "streak", target: 14 },
      { type: "meals", target: 10 }, { type: "exercises", target: 5 },
      { type: "plan", target: 50 }, { type: "plan", target: 100 },
      { type: "teas", target: 14 }, { type: "plan", target: 100 } // Certificado y Campeón
    ];
    
    let unlockedCount = 0;
    for (const r of REWARDS) {
      if (r.type === "streak" && maxStreak >= r.target) unlockedCount++;
      if (r.type === "meals" && meals >= r.target) unlockedCount++;
      if (r.type === "exercises" && exercises >= r.target) unlockedCount++;
      if (r.type === "teas" && teas >= r.target) unlockedCount++;
      if (r.type === "plan" && planPct >= r.target) unlockedCount++;
    }
    
    return unlockedCount;
  }, [allProgress, planPct]);

  return (
    <AppShell>
      {/* HEADER: Modern & Clean */}
      <header className="px-5 pt-10 pb-2 flex items-center justify-between bg-background z-10 sticky top-0 bg-opacity-90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-tr from-primary to-green-400 text-white shadow-sm ring-2 ring-background">
            <span className="text-base font-bold">{firstName[0].toUpperCase()}</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bienvenido de vuelta</p>
            <p className="text-xl font-display font-extrabold text-foreground leading-tight">{firstName} 👋</p>
          </div>
        </div>
        <button onClick={handleLogout} className="grid h-10 w-10 place-items-center rounded-full bg-secondary/50 text-foreground transition-transform active:scale-95" title="Cerrar Sesión">
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      {/* HORIZONTAL DAY NAV */}
      <section className="mt-4 px-5">
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {Array.from({ length: 21 }).map((_, i) => {
            const dayNum = i + 1;
            const isPast = dayNum < currentDay;
            const isCurrent = dayNum === currentDay;
            const pd = allProgress?.find(p => p.day_number === dayNum);
            const isSuccess = pd?.mission_done || pd?.exercise_done;

            return (
              <div 
                key={dayNum} 
                className={`snap-center shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-2xl border transition-all ${
                  isCurrent 
                    ? "bg-primary border-primary text-white shadow-md transform scale-105" 
                    : isPast 
                      ? "bg-white border-border/60 text-muted-foreground" 
                      : "bg-background border-dashed border-border/50 text-muted-foreground opacity-50"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Día</span>
                <span className="text-lg font-display font-bold leading-none mt-0.5">{dayNum}</span>
                {isPast && isSuccess && (
                  <div className="absolute -bottom-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white grid place-items-center">
                    <Check className="h-2 w-2 text-white" strokeWidth={4} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* MAIN PROGRESS DASHBOARD */}
      <section className="px-5 mt-2">
        <div className="rounded-[2rem] bg-slate-900 text-white p-6 shadow-xl relative overflow-hidden group">
          {/* Decorative background glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary rounded-full mix-blend-screen filter blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Objetivo 21 Días</p>
              <h2 className="mt-1 font-display text-3xl font-extrabold leading-tight">Tu Progreso</h2>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md border border-white/5">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-xs font-bold text-white/90">-{lostKg.toFixed(1)} kg</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md border border-white/5">
                  <Target className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-bold text-white/90">{remainingKg.toFixed(1)} kg left</span>
                </div>
              </div>
            </div>
            
            {/* Circular Progress */}
            <div className="relative w-[100px] h-[100px] shrink-0 drop-shadow-lg">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
                <circle
                  cx="50" cy="50" r={radius} 
                  stroke="currentColor" 
                  strokeWidth="10" 
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-emerald-400 transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-display font-black leading-none">{planPct}%</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white/80 flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" /> Evolución de Peso
              </h3>
              
              <Dialog open={isWeightModalOpen} onOpenChange={setIsWeightModalOpen}>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full hover:bg-emerald-400/20 transition-colors">
                    <Plus className="h-3 w-3" /> Actualizar
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-[2rem] p-6 border-0 shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl">Registrar Peso</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">Ingresa tu peso actual para actualizar tu gráfico de progreso.</p>
                  </DialogHeader>
                  <div className="my-6">
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="00.0"
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        className="text-center font-display text-4xl h-20 rounded-2xl bg-secondary/30 border-0 focus-visible:ring-primary focus-visible:ring-2"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">kg</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <DialogClose asChild>
                      <button className="flex-1 rounded-xl bg-secondary py-3.5 font-bold text-foreground">Cancelar</button>
                    </DialogClose>
                    <button
                      disabled={!weightInput || updateWeight.isPending}
                      onClick={() => updateWeight.mutate(parseFloat(weightInput))}
                      className="flex-1 rounded-xl bg-primary py-3.5 font-bold text-white shadow-lg shadow-primary/30 disabled:opacity-50 transition-active"
                    >
                      {updateWeight.isPending ? "Guardando..." : "Guardar Peso"}
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* WEIGHT CHART */}
            <div className="h-[120px] w-full">
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 15, right: 0, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <YAxis domain={['dataMin - 1.5', 'dataMax + 1.5']} hide />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', fontWeight: 'bold' }}
                      itemStyle={{ color: '#34d399' }}
                    />
                    {profile.goal_weight && (
                      <ReferenceLine 
                        y={profile.goal_weight} 
                        stroke="#3b82f6" 
                        strokeDasharray="4 4" 
                        strokeWidth={1.5}
                        label={{ position: 'insideTopLeft', value: 'Meta', fill: '#60a5fa', fontSize: 10, fontWeight: 'bold' }} 
                      />
                    )}
                    <Area 
                      type="monotone" 
                      dataKey="peso" 
                      stroke="#34d399" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorWeight)"
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#34d399' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl">
                  <p className="text-xs font-semibold text-white/50 text-center">
                    Actualiza tu peso para<br/>ver tu curva de progreso.
                  </p>
                </div>
              )}
            </div>
            
            {/* WEIGHT STATS ROW */}
            <div className="mt-4 flex justify-between px-2 items-center">
              <div className="text-left w-1/3">
                <p className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Inicial</p>
                <p className="text-lg font-bold leading-tight">{profile.start_weight || "—"} <span className="text-xs font-normal text-white/70">kg</span></p>
              </div>
              <div className="text-center w-1/3 border-x border-white/10 flex flex-col items-center">
                {imcData ? (
                  <>
                    <p className="text-[10px] uppercase font-bold text-white/50 tracking-wider">IMC</p>
                    <p className={`text-lg font-black leading-tight ${imcData.color}`}>{imcData.value}</p>
                    <div className={`mt-0.5 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 ${imcData.color}`}>
                      {imcData.label}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Actual</p>
                    <p className="text-xl font-bold text-white leading-tight">{profile.current_weight || "—"} <span className="text-xs font-normal text-white/70">kg</span></p>
                  </>
                )}
              </div>
              <div className="text-right w-1/3">
                <p className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Meta</p>
                <p className="text-lg font-bold leading-tight">{profile.goal_weight || "—"} <span className="text-xs font-normal text-white/70">kg</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK STATS (GLASSMORPHISM) */}
      <section className="px-5 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[1.5rem] bg-white border border-border/40 p-4 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-500 grid place-items-center shrink-0">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Racha</p>
              <p className="text-xl font-display font-black leading-none text-foreground">{stats.streak} <span className="text-sm font-bold text-muted-foreground">días</span></p>
            </div>
          </div>
          
          <div className="rounded-[1.5rem] bg-white border border-border/40 p-4 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-cyan-100 text-cyan-500 grid place-items-center shrink-0">
              <span className="text-xl">🍵</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Té</p>
              <p className="text-xl font-display font-black leading-none text-foreground">{stats.water}<span className="text-sm font-bold text-muted-foreground">%</span></p>
            </div>
          </div>
          
          <div className="rounded-[1.5rem] bg-white border border-border/40 p-4 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-500 grid place-items-center shrink-0">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Treino</p>
              <p className="text-xl font-display font-black leading-none text-foreground">{stats.exercise}<span className="text-sm font-bold text-muted-foreground">%</span></p>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white border border-border/40 p-4 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 text-green-500 grid place-items-center shrink-0">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Dieta</p>
              <p className="text-xl font-display font-black leading-none text-foreground">{stats.meals}<span className="text-sm font-bold text-muted-foreground">%</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION CARD (Refined) */}
      <section className="mt-5 px-5">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-foreground">Tu Misión de Hoy</h3>
        </div>
        <button
          onClick={() => upsertProgress.mutate({ mission_done: !progress?.mission_done })}
          className={`relative w-full overflow-hidden rounded-[1.5rem] border ${progress?.mission_done ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-white'} p-5 text-left shadow-sm transition-all duration-300 active:scale-[0.98] group`}
        >
          <div className="flex items-center gap-4">
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-colors ${progress?.mission_done ? "bg-primary text-white" : "bg-secondary/20 text-primary"}`}>
              <Sparkles className="h-6 w-6" />
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-[15px] font-bold leading-snug transition-colors ${progress?.mission_done ? "text-primary line-through opacity-80" : "text-foreground group-hover:text-primary"}`}>
                {missionText}
              </p>
            </div>
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-all ${progress?.mission_done ? "border-primary bg-primary text-white scale-110" : "border-border bg-background"}`}>
              {progress?.mission_done && <Check className="h-4 w-4" strokeWidth={3} />}
            </span>
          </div>
        </button>
      </section>

      {/* MEGA GRID */}
      <section className="mt-8 px-5 mb-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-foreground">Acciones Rápidas</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MegaCard to="/plan" image="/mi_plan_real.webp" title="Mi Plan" subtitle="Opciones de hoy" />
          <MegaCard to="/ejercicios" image="/ejercicios_real.webp" title="Ejercicios" subtitle="Tu rutina diaria" />
          <MegaCard to="/compras" image="/compras_real.webp" title="Compras" subtitle="Por semana" />
          <MegaCard to="/te" image="/te_real.webp" title="Té del Día" subtitle={(progress?.water_glasses ?? 0) > 0 ? "Consumido" : "Pendiente"} />
          <MegaCard to="/recompensas" image="/images/recipes/botao_recompensas.jpeg" title="Recompensas" subtitle={`${unlockedRewardsCount} de 8 desbloqueadas`} />
          <MegaCard to="/analizar" image="/calorias_ia_real.webp" title="Calorías IA" subtitle="Analizar comida" />
        </div>
      </section>

      <div className="h-10" />
    </AppShell>
  );
}

function MegaCard({
  to, image, title, subtitle
}: { to: string; image: string; title: string; subtitle: string; }) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-sm transition-all duration-300 hover:shadow-md active:scale-[0.98] border border-border/40"
      style={{ minHeight: '130px' }}
    >
      <div className="absolute inset-0 z-0">
        <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>
      <div className="relative z-10 mt-auto p-4 flex justify-between items-end">
        <div>
          <p className="text-white font-display text-lg font-bold leading-tight">{title}</p>
          <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wider">{subtitle}</p>
        </div>
        <div className="h-6 w-6 rounded-full bg-white/20 backdrop-blur-md grid place-items-center text-white">
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}
