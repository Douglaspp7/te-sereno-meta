import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, Sparkles, LogOut, Flame, Target, ChevronRight, Droplet, Dumbbell, Utensils, Lock, Gift, ArrowRight, Camera, Activity, FileText, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "./AppShell";
import confetti from "canvas-confetti";
import { teas } from "@/data/teas";

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
        if (r.type === "streak") remainingText = `Faltan ${remaining} días.`;
        if (r.type === "meals") remainingText = `Faltan ${remaining} comidas completadas.`;
        if (r.type === "exercises") remainingText = `Falta ${remaining} ejercicio${remaining > 1 ? 's' : ''}.`;
        if (r.type === "teas") remainingText = `Faltan ${remaining} tés.`;
        if (r.type === "plan") remainingText = `Falta ${remaining}% del plan.`;
        
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

  // Dynamic CTAs & Texts
  const pendingCTA = useMemo(() => {
    if (!progress.mission_done) {
      return { 
        title: "MISIÓN ACTUAL", 
        subtitle: missionText,
        icon: Sparkles, 
        action: () => upsertProgress.mutate({ mission_done: true }), 
        btnText: "Completar Misión",
        color: "bg-amber-500",
        lightBg: "bg-amber-50"
      };
    }
    if ((progress.water_glasses || 0) === 0) {
      return { 
        title: "TÉ PENDIENTE", 
        subtitle: teas.find(t => t.day === currentDay)?.name || "Té de hoy",
        icon: Droplet, 
        action: () => navigate({ to: "/te" }), 
        btnText: "Preparar Té",
        color: "bg-cyan-500",
        lightBg: "bg-cyan-50"
      };
    }
    if (!progress.breakfast_done) {
      return { title: "COMIDA PENDIENTE", subtitle: "Desayuno pendiente", icon: Utensils, action: () => navigate({ to: "/plan" }), btnText: "Ver Menú", color: "bg-green-500", lightBg: "bg-green-50" };
    }
    if (!progress.lunch_done) {
      return { title: "COMIDA PENDIENTE", subtitle: "Almuerzo pendiente", icon: Utensils, action: () => navigate({ to: "/plan" }), btnText: "Ver Menú", color: "bg-green-500", lightBg: "bg-green-50" };
    }
    if (!progress.dinner_done) {
      return { title: "COMIDA PENDIENTE", subtitle: "Cena pendiente", icon: Utensils, action: () => navigate({ to: "/plan" }), btnText: "Ver Menú", color: "bg-green-500", lightBg: "bg-green-50" };
    }
    if (!progress.exercise_done) {
      return { 
        title: "ENTRENAMIENTO PENDIENTE", 
        subtitle: "Apenas 20 minutos hoy",
        icon: Dumbbell, 
        action: () => navigate({ to: "/ejercicios" }), 
        btnText: "Hacer Ejercicio",
        color: "bg-indigo-500",
        lightBg: "bg-indigo-50"
      };
    }
    return { 
      title: "🎉 ¡Día completado!", 
      subtitle: "Excelente trabajo.\nVuelve mañana para seguir avanzando.",
      icon: Check, 
      action: () => navigate({ to: "/recompensas" }), 
      btnText: "Ver mis recompensas",
      color: "bg-emerald-500",
      lightBg: "bg-emerald-50",
      isDone: true 
    };
  }, [progress, missionText, navigate, upsertProgress, currentDay]);

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

  // Dynamic Texts
  const heroMotivationalMessage = useMemo(() => {
    if (currentDay >= 21) return "🎉 ¡Lo lograste! Has completado el reto.";
    if (currentDay >= 15) return "🚀 Ya estás más cerca de tu meta.";
    if (currentDay >= 8) return "💪 Estás construyendo nuevos hábitos.";
    return "🔥 ¡Tu transformación ha comenzado!";
  }, [currentDay]);

  const streakMessage = useMemo(() => {
    if (stats.streak >= 21) return "🏆 ¡Reto completado!";
    if (stats.streak >= 15) return "🔥 ¡Increíble disciplina!";
    if (stats.streak >= 8) return "🔥 Estás creando un hábito.";
    if (stats.streak >= 4) return "🔥 ¡No rompas tu racha!";
    return "🔥 ¡Buen comienzo!";
  }, [stats.streak]);

  const currentTea = teas.find(t => t.day === currentDay) || teas[0];
  const pendingMealText = !progress.breakfast_done ? "🍓 Desayuno pendiente" : !progress.lunch_done ? "🥗 Almuerzo pendiente" : !progress.dinner_done ? "🍽 Cena pendiente" : "✓ Comidas listas";

  const isChallengeCompleted = currentDay === 21 && pendingCTA.isDone;

  return (
    <AppShell>
      {/* 1. HEADER */}
      <header className="px-5 pt-10 pb-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-900 text-white shadow-md border-2 border-primary/20">
            <span className="text-base font-bold">{firstName[0].toUpperCase()}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Bienvenido,</p>
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
      <section className="px-5 mt-2 animate-in fade-in zoom-in-95 duration-700">
        <div className="rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-xl relative overflow-hidden transition-all">
          {/* Decoraciones */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
          
          {isChallengeCompleted ? (
             <div className="relative z-10 flex flex-col items-center text-center py-4">
               <div className="h-16 w-16 bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-full grid place-items-center mb-4 shadow-lg shadow-yellow-500/30">
                 <Target className="h-8 w-8 text-white" />
               </div>
               <h2 className="text-white font-display text-3xl font-black mb-2">🎉 ¡Felicidades!</h2>
               <p className="text-white/90 text-sm mb-6">Has completado MiReto21.</p>
               <div className="w-full space-y-3">
                 <Link to="/recompensas" className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-sm font-bold text-slate-900 shadow-md">
                   <FileText className="h-4 w-4" /> Descargar certificado
                 </Link>
                 <button className="flex w-full items-center justify-center gap-2 rounded-full bg-white/10 border border-white/20 py-3.5 text-sm font-bold text-white backdrop-blur-md">
                   <RotateCcw className="h-4 w-4" /> Comenzar nuevamente
                 </button>
               </div>
             </div>
          ) : (
             <>
                <div className="relative z-10 flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-white font-display text-4xl font-black">Día {currentDay} <span className="text-white/40 text-2xl font-medium">/ 21</span></h2>
                    <p className="text-emerald-400 font-bold text-sm mt-1">{heroMotivationalMessage}</p>
                  </div>
                </div>

                <div className="relative z-10 mb-6">
                  <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${planPct}%` }}
                    />
                  </div>
                </div>

                {firstLockedReward && (
                  <div className="relative z-10 bg-black/20 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-white/10 grid place-items-center">
                            <Gift className="h-5 w-5 text-indigo-400" />
                         </div>
                         <div>
                            <p className="text-[10px] uppercase font-black text-indigo-400 tracking-wider mb-0.5">Próxima recompensa</p>
                            <p className="text-sm font-bold text-white">{firstLockedReward.name}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="text-xs font-bold text-white/70">{firstLockedReward.remainingText}</p>
                       </div>
                    </div>
                  </div>
                )}
             </>
          )}
        </div>
      </section>

      {/* 3. CARD CONTINUAR MI DÍA (Main CTA) */}
      {!isChallengeCompleted && (
        <section className="px-5 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <div className={`rounded-[2rem] border p-6 transition-all shadow-md flex flex-col justify-between ${pendingCTA.lightBg} border-${pendingCTA.color.replace('bg-', '')}/30`}>
            <div className="flex items-start gap-4 mb-5">
              <div className={`h-14 w-14 rounded-2xl grid place-items-center text-white shrink-0 ${pendingCTA.color} shadow-lg shadow-${pendingCTA.color.replace('bg-', '')}/30`}>
                <pendingCTA.icon className="h-7 w-7" />
              </div>
              <div className="pt-1">
                <p className={`text-[10px] font-black uppercase tracking-wider mb-1 text-${pendingCTA.color.replace('bg-', '')}-700`}>{pendingCTA.title}</p>
                <h4 className="font-display font-bold text-lg text-foreground leading-snug whitespace-pre-line">{pendingCTA.subtitle}</h4>
              </div>
            </div>
            {pendingCTA.action && (
              <button 
                onClick={pendingCTA.action}
                className={`w-full h-14 rounded-full font-bold text-white flex justify-center items-center gap-2 shadow-lg active:scale-95 transition-transform ${pendingCTA.color}`}
              >
                {pendingCTA.btnText} <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </section>
      )}

      {/* 4. MISIÓN DE HOY */}
      {!isChallengeCompleted && (
        <section className="px-5 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
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
                  <p className="text-[15px] font-bold text-emerald-700">✓ ¡Misión completada!</p>
                ) : (
                  <p className="text-[15px] font-bold text-foreground leading-snug">{missionText}</p>
                )}
              </div>
            </div>
          </button>
        </section>
      )}

      {/* 5. GRADE DE FUNCIONALIDADES */}
      <section className="px-5 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <h3 className="text-sm font-bold text-foreground mb-3 px-1">Explorar</h3>
        <div className="grid grid-cols-2 gap-3">
          <MegaCard to="/plan" image="/mi_plan_real.webp" title="Mi Plan" subtitle={pendingMealText} />
          <MegaCard to="/ejercicios" image="/ejercicios_real.webp" title="Ejercicios" subtitle="Rutina diaria" />
          <MegaCard to="/compras" image="/compras_real.webp" title="Compras" subtitle="Lista semanal" />
          <MegaCard to="/te" image={`/images/teas/tea_${currentTea.day}.jpg`} fallbackImage="/te_real.webp" title={currentTea.name} subtitle={currentTea.category} />
          <MegaCard to="/recompensas" image="/recompensas_botao.png" title="Recompensas" subtitle={`🏆 ${stats.unlockedRewards} de 8 desbloqueadas`} />
          
          <Link to="/analizar" className="group relative flex flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-sm border border-border/40 transition-all hover:-translate-y-1 hover:shadow-md" style={{ minHeight: '140px' }}>
            <div className="absolute inset-0 z-0">
              <img src="/calorias_ia_real.webp" alt="Calorías IA" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
            </div>
            {/* PREMIUM VIP BADGE */}
            <div className="absolute top-3 right-3 z-20 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-yellow-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-[0_4px_12px_rgba(251,191,36,0.4)] flex items-center gap-1 border border-yellow-200/50">
              <Lock className="h-3 w-3" /> ⭐ Premium
            </div>
            <div className="relative z-10 mt-auto p-4">
              <p className="text-white font-display text-xl font-black leading-tight drop-shadow-md">Calorías IA</p>
              <p className="text-white/90 text-[10px] font-bold uppercase tracking-wider mt-0.5">Analiza tu comida</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 6. MÉTRICAS GAMIFICADAS */}
      <section className="px-5 mt-8 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
        <h3 className="text-sm font-bold text-foreground mb-3 px-1">Tus Logros</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Racha Card Expandida */}
          <div className="rounded-[1.5rem] bg-white border border-border/50 p-4 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-500 grid place-items-center shrink-0">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-black text-foreground leading-none">{stats.streak} <span className="text-xs font-bold text-muted-foreground">días</span></p>
              <p className="text-[10px] font-bold text-orange-500 mt-1 uppercase tracking-wider">{streakMessage}</p>
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-white border border-border/50 p-4 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-500 grid place-items-center shrink-0">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-black text-foreground leading-none">{stats.exercises} <span className="text-xs font-bold text-muted-foreground">/ 21</span></p>
              <p className="text-[10px] font-bold text-indigo-500 mt-1 uppercase tracking-wider">Entrenamientos</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[1.5rem] bg-white border border-border/50 p-4 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-cyan-100 text-cyan-500 grid place-items-center shrink-0">
              <Droplet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-black text-foreground leading-none">{stats.teas} <span className="text-xs font-bold text-muted-foreground">/ 21</span></p>
              <p className="text-[10px] font-bold text-cyan-500 mt-1 uppercase tracking-wider">Tés Tomados</p>
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-white border border-border/50 p-4 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-yellow-100 text-yellow-600 grid place-items-center shrink-0">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-black text-foreground leading-none">{stats.unlockedRewards} <span className="text-xs font-bold text-muted-foreground">/ 8</span></p>
              <p className="text-[10px] font-bold text-yellow-600 mt-1 uppercase tracking-wider">Premios</p>
            </div>
          </div>
        </div>
      </section>

      <div className="h-10" />
    </AppShell>
  );
}

function MegaCard({
  to, image, fallbackImage, title, subtitle
}: { to: string; image: string; fallbackImage?: string; title: string; subtitle: string; }) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-[0.98] border border-border/40"
      style={{ minHeight: '140px' }}
    >
      <div className="absolute inset-0 z-0">
        <img 
          src={image} 
          alt={title} 
          onError={(e) => { if (fallbackImage) (e.target as HTMLImageElement).src = fallbackImage; }}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>
      <div className="relative z-10 mt-auto p-4">
        <p className="text-white font-display text-xl font-black leading-tight drop-shadow-md">{title}</p>
        <p className="text-white/90 text-[10px] font-bold uppercase tracking-wider mt-0.5">{subtitle}</p>
      </div>
    </Link>
  );
}
