import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, Sparkles, LogOut, Flame, Target, ChevronRight, Droplet, Dumbbell, Utensils, Lock, Gift, ArrowRight, Camera, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "./AppShell";
import confetti from "canvas-confetti";

type Profile = {
  display_name: string | null;
  start_weight: number | null;
  current_weight: number | null;
  goal_weight: number | null;
  plan_started_at: string | null;
  height_cm: number | null;
};

// Recompensa definition based on recompensas.tsx
const REWARDS = [
  { id: 1, name: "10 Recetas Express", type: "streak", target: 7 },
  { id: 2, name: "Postres Saludables", type: "streak", target: 14 },
  { id: 3, name: "Guía de Compras Inteligentes", type: "meals", target: 10 },
  { id: 4, name: "Menú de Emergencia", type: "exercises", target: 5 },
  { id: 5, name: "21 Recetas Premium Extra", type: "plan", target: 50 },
  { id: 7, name: "Maestro del Té", type: "teas", target: 14 },
  { id: 6, name: "Certificado Oficial MiReto21", type: "plan", target: 100 },
  { id: 8, name: "Campeón MiReto21", type: "plan", target: 100 },
];

export function Dashboard({ userId, profile }: { userId: string; profile: Profile }) {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const currentDay = useMemo(() => {
    if (!profile.plan_started_at) return 1;
    const start = new Date(profile.plan_started_at);
    const today = new Date();
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(21, Math.max(1, diff + 1));
  }, [profile.plan_started_at]);

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

  const progress = allProgress?.find(p => p.day_number === currentDay) || { 
    mission_done: false, exercise_done: false, breakfast_done: false, lunch_done: false, dinner_done: false, water_glasses: 0 
  };

  const { data: dayData } = useQuery({
    queryKey: ["day", currentDay],
    queryFn: async () => {
      const { data } = await supabase.from('days').select('*').eq('day_number', currentDay).maybeSingle();
      return data;
    }
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["daily_progress", userId] }),
  });

  // Calculate stats & rewards
  const { stats, planPct, remainingKg, firstLockedReward } = useMemo(() => {
    let streak = 0, maxStreak = 0;
    let meals = 0, exercises = 0, teas = 0;
    let prevDay = 0;

    if (allProgress) {
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
    }

    const pct = Math.min(100, Math.round((currentDay / 21) * 100));
    
    // Evaluate Rewards
    let unlockedCount = 0;
    let nextReward = null;
    
    for (const r of REWARDS) {
      let current = 0;
      if (r.type === "streak") current = maxStreak;
      if (r.type === "meals") current = meals;
      if (r.type === "exercises") current = exercises;
      if (r.type === "teas") current = teas;
      if (r.type === "plan") current = pct;
      
      const isUnlocked = current >= r.target;
      if (isUnlocked) {
        unlockedCount++;
      } else if (!nextReward) {
        // Grab the first locked reward
        const remaining = r.target - current;
        let remainingText = "";
        if (r.type === "streak") remainingText = `Faltan ${remaining} días`;
        if (r.type === "meals") remainingText = `Faltan ${remaining} comidas`;
        if (r.type === "exercises") remainingText = `Falta ${remaining} ejercicio${remaining > 1 ? 's' : ''}`;
        if (r.type === "teas") remainingText = `Faltan ${remaining} tés`;
        if (r.type === "plan") remainingText = `Falta ${remaining}% del plan`;
        
        nextReward = { ...r, remainingText, current, target: r.target };
      }
    }

    const remKg = profile.current_weight && profile.goal_weight
      ? Math.max(0, profile.current_weight - profile.goal_weight)
      : 0;

    return {
      stats: { streak: maxStreak, meals, exercises, teas, unlockedRewards: unlockedCount },
      planPct: pct,
      remainingKg: remKg,
      firstLockedReward: nextReward
    };
  }, [allProgress, currentDay, profile]);

  const firstName = profile.display_name?.split(" ")[0] ?? "Usuario";
  const missionText = dayData?.mission?.replace(/^[^\w\s]+\s/, "") || "Cargando misión...";

  // Dynamic CTA Hierarchy
  const pendingCTA = useMemo(() => {
    if (!progress.mission_done) {
      return { 
        title: "Misión del día pendiente", 
        subtitle: "Hoy: " + (missionText.length > 25 ? missionText.substring(0, 25) + "..." : missionText),
        icon: Sparkles, 
        action: () => upsertProgress.mutate({ mission_done: true }), 
        btnText: "Completar Misión",
        color: "bg-amber-500",
        lightBg: "bg-amber-50"
      };
    }
    if ((progress.water_glasses || 0) === 0) {
      return { 
        title: "Té del día pendiente", 
        subtitle: "Acelera tu metabolismo",
        icon: Droplet, 
        action: () => navigate({ to: "/te" }), 
        btnText: "Preparar Té",
        color: "bg-cyan-500",
        lightBg: "bg-cyan-50"
      };
    }
    if (!progress.breakfast_done || !progress.lunch_done || !progress.dinner_done) {
      return { 
        title: "Comidas pendientes", 
        subtitle: "Sigue tu menú diario",
        icon: Utensils, 
        action: () => navigate({ to: "/plan" }), 
        btnText: "Ver Menú",
        color: "bg-green-500",
        lightBg: "bg-green-50"
      };
    }
    if (!progress.exercise_done) {
      return { 
        title: "Ejercicio pendiente", 
        subtitle: "Apenas 20 minutos hoy",
        icon: Dumbbell, 
        action: () => navigate({ to: "/ejercicios" }), 
        btnText: "Hacer Ejercicio",
        color: "bg-indigo-500",
        lightBg: "bg-indigo-50"
      };
    }
    return { 
      title: "¡Día completado! 🎉", 
      subtitle: "Has hecho un trabajo increíble hoy.",
      icon: Check, 
      action: null, 
      btnText: "¡Vuelve mañana!",
      color: "bg-emerald-500",
      lightBg: "bg-emerald-50",
      isDone: true 
    };
  }, [progress, missionText, navigate, upsertProgress]);

  const handleMissionComplete = () => {
    upsertProgress.mutate({ mission_done: !progress.mission_done });
    if (!progress.mission_done) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <AppShell>
      {/* 1. HEADER */}
      <header className="px-5 pt-10 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-900 text-white shadow-md border-2 border-primary/20">
            <span className="text-base font-bold">{firstName[0].toUpperCase()}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Bienvenido de vuelta,</p>
            <p className="text-2xl font-display font-extrabold text-foreground leading-tight">{firstName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/progreso" className="grid h-10 w-10 place-items-center rounded-full bg-secondary/80 text-foreground transition-transform active:scale-95" title="Mi Progreso">
            <Activity className="h-4 w-4" />
          </Link>
          <button onClick={handleLogout} className="grid h-10 w-10 place-items-center rounded-full bg-secondary/80 text-foreground transition-transform active:scale-95" title="Cerrar Sesión">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* 2. HERO DE PROGRESSO */}
      <section className="px-5 mt-2">
        <div className="rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-xl relative overflow-hidden">
          {/* Decoraciones */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex justify-between items-end mb-4">
            <div>
              <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-1">Tu Jornada</p>
              <h2 className="text-white font-display text-4xl font-black">Día {currentDay} <span className="text-white/50 text-2xl font-medium">/ 21</span></h2>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-white font-bold text-sm">{stats.streak} días</span>
            </div>
          </div>

          <div className="relative z-10 mb-5">
            <div className="flex justify-between text-xs font-bold text-white/70 mb-2">
              <span>Progreso del plan</span>
              <span>{planPct}%</span>
            </div>
            <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-emerald-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${planPct}%` }}
              />
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10">
            <p className="text-white/90 text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-400" /> 
              {remainingKg > 0 
                ? `¡Excelente progreso! Te faltan ${remainingKg.toFixed(1)} kg para tu meta.` 
                : "¡Has alcanzado tu meta de peso! Sigue así."}
            </p>
          </div>
        </div>
      </section>

      {/* 3. CARD CONTINUAR MI DÍA (Main CTA) */}
      <section className="px-5 mt-6">
        <h3 className="text-sm font-bold text-foreground mb-3 px-1">Continuar Mi Día</h3>
        <div className={`rounded-[1.5rem] border p-5 transition-all shadow-sm flex items-center justify-between ${pendingCTA.lightBg} border-${pendingCTA.color.replace('bg-', '')}/20`}>
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-2xl grid place-items-center text-white ${pendingCTA.color} shadow-lg`}>
              <pendingCTA.icon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-display font-bold text-[17px] text-foreground leading-tight">{pendingCTA.title}</h4>
              <p className="text-sm text-muted-foreground font-medium mt-0.5">{pendingCTA.subtitle}</p>
            </div>
          </div>
          {pendingCTA.action && (
            <button 
              onClick={pendingCTA.action}
              className={`h-10 px-4 rounded-full font-bold text-white flex items-center gap-1.5 shadow-md active:scale-95 transition-transform ${pendingCTA.color}`}
            >
              {pendingCTA.btnText}
            </button>
          )}
        </div>
      </section>

      {/* 4. MISIÓN DE HOY */}
      <section className="px-5 mt-6">
        <h3 className="text-sm font-bold text-foreground mb-3 px-1">Misión de Hoy</h3>
        <button
          onClick={handleMissionComplete}
          className={`w-full rounded-[1.5rem] border p-4 text-left shadow-sm transition-all duration-300 active:scale-[0.98] ${
            progress.mission_done 
              ? 'bg-emerald-50 border-emerald-200' 
              : 'bg-white border-border/60 hover:border-border'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-all ${
              progress.mission_done 
                ? "border-emerald-500 bg-emerald-500 text-white" 
                : "border-muted-foreground/30 bg-transparent"
            }`}>
              {progress.mission_done && <Check className="h-4 w-4" strokeWidth={3} />}
            </div>
            <div className="flex-1 min-w-0">
              {progress.mission_done ? (
                <p className="text-[15px] font-bold text-emerald-700">✓ Misión completada.</p>
              ) : (
                <p className="text-[15px] font-bold text-foreground leading-snug">{missionText}</p>
              )}
            </div>
          </div>
        </button>
      </section>

      {/* 5. GRADE DE FUNCIONALIDADES */}
      <section className="px-5 mt-8">
        <h3 className="text-sm font-bold text-foreground mb-3 px-1">Explorar</h3>
        <div className="grid grid-cols-2 gap-3">
          <MegaCard to="/plan" image="/mi_plan_real.webp" title="Mi Plan" subtitle="Opciones de hoy" />
          <MegaCard to="/ejercicios" image="/ejercicios_real.webp" title="Ejercicios" subtitle="Rutina diaria" />
          <MegaCard to="/compras" image="/compras_real.webp" title="Compras" subtitle="Lista semanal" />
          <MegaCard to="/te" image="/te_real.webp" title="Té del Día" subtitle="Infusiones" />
          <MegaCard to="/recompensas" image="/images/recipes/botao_recompensas.jpeg" title="Recompensas" subtitle="Premios" />
          
          <Link to="/analizar" className="group relative flex flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-sm border border-border/40" style={{ minHeight: '140px' }}>
            <div className="absolute inset-0 z-0">
              <img src="/calorias_ia_real.webp" alt="Calorías IA" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
            </div>
            {/* VIP BADGE */}
            <div className="absolute top-3 right-3 z-20 bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
              <Lock className="h-2.5 w-2.5" /> ⭐ Premium
            </div>
            <div className="relative z-10 mt-auto p-4">
              <p className="text-white font-display text-xl font-black leading-tight drop-shadow-md">Calorías IA</p>
              <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider mt-0.5">Analizar comida</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 6. MÉTRICAS GAMIFICADAS */}
      <section className="px-5 mt-8">
        <h3 className="text-sm font-bold text-foreground mb-3 px-1">Tus Logros</h3>
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-2xl bg-white border border-border/50 p-3 text-center shadow-sm flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-500 grid place-items-center mb-1">
              <Flame className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Racha</p>
            <p className="text-sm font-black text-foreground">{stats.streak} <span className="text-[9px] font-medium text-muted-foreground">d.</span></p>
          </div>
          <div className="rounded-2xl bg-white border border-border/50 p-3 text-center shadow-sm flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-500 grid place-items-center mb-1">
              <Dumbbell className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Treino</p>
            <p className="text-sm font-black text-foreground">{stats.exercises}<span className="text-[9px] font-medium text-muted-foreground">/21</span></p>
          </div>
          <div className="rounded-2xl bg-white border border-border/50 p-3 text-center shadow-sm flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-cyan-100 text-cyan-500 grid place-items-center mb-1">
              <Droplet className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Té</p>
            <p className="text-sm font-black text-foreground">{stats.teas}<span className="text-[9px] font-medium text-muted-foreground">/21</span></p>
          </div>
          <div className="rounded-2xl bg-white border border-border/50 p-3 text-center shadow-sm flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-yellow-100 text-yellow-600 grid place-items-center mb-1">
              <Gift className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Premios</p>
            <p className="text-sm font-black text-foreground">{stats.unlockedRewards}<span className="text-[9px] font-medium text-muted-foreground">/8</span></p>
          </div>
        </div>
      </section>

      {/* 7. PRÓXIMA RECOMPENSA */}
      {firstLockedReward && (
        <section className="px-5 mt-8 mb-10">
          <div className="rounded-[1.5rem] border border-border bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1 flex items-center gap-1">
                  <Gift className="h-3 w-3" /> Próxima recompensa
                </p>
                <h4 className="font-display font-bold text-lg text-foreground">{firstLockedReward.name}</h4>
                <p className="text-sm text-muted-foreground font-medium mt-1">{firstLockedReward.remainingText}</p>
              </div>
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white dark:bg-black shadow-sm text-indigo-500 border border-indigo-100 dark:border-indigo-900">
                <Lock className="h-5 w-5" />
              </div>
            </div>
            
            <div className="mt-4 h-2 w-full bg-indigo-100 dark:bg-indigo-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full" 
                style={{ width: `${Math.min(100, (firstLockedReward.current / firstLockedReward.target) * 100)}%` }} 
              />
            </div>
            
            <Link to="/recompensas" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white dark:bg-secondary py-3 text-sm font-bold text-foreground shadow-sm border border-border transition-colors hover:bg-muted">
              Ver recompensas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

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
      style={{ minHeight: '140px' }}
    >
      <div className="absolute inset-0 z-0">
        <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>
      <div className="relative z-10 mt-auto p-4">
        <p className="text-white font-display text-xl font-black leading-tight drop-shadow-md">{title}</p>
        <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider mt-0.5">{subtitle}</p>
      </div>
    </Link>
  );
}
