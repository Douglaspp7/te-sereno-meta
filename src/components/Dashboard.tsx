import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, LogOut, Flame, Target, ChevronRight, Droplet, Dumbbell, Utensils, Lock, Gift, ArrowRight, Activity, FileText, RotateCcw, User, Bell, Star } from "lucide-react";
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
  subscription_status?: string | null;
  subscription_plan?: string | null;
};

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
      const { data } = await supabase.from("daily_progress").select("*").eq("user_id", userId).order("day_number", { ascending: true });
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
        const remaining = r.target - current;
        let remainingText = "";
        if (r.type === "streak") remainingText = `Faltan ${remaining} días`;
        if (r.type === "meals") remainingText = `Faltan ${remaining} comidas`;
        if (r.type === "exercises") remainingText = `Falta ${remaining} ej.`;
        if (r.type === "teas") remainingText = `Faltan ${remaining} tés`;
        if (r.type === "plan") remainingText = `Falta ${remaining}%`;
        
        nextReward = { ...r, remainingText, current, target: r.target };
      }
    }

    let remKg = 0;
    if (profile.current_weight && profile.goal_weight) {
      remKg = parseFloat(Math.max(0, profile.current_weight - profile.goal_weight).toFixed(1));
    } else if (profile.start_weight && profile.goal_weight) {
      remKg = parseFloat(Math.max(0, profile.start_weight - profile.goal_weight).toFixed(1));
    }

    return {
      stats: { streak: maxStreak, meals, exercises, teas, unlockedRewards: unlockedCount },
      planPct: pct,
      remainingKg: remKg,
      firstLockedReward: nextReward
    };
  }, [allProgress, currentDay, profile]);

  const firstName = profile.display_name?.split(" ")[0] ?? "Usuario";
  const missionText = dayData?.mission?.replace(/^[^\w\s]+\s/, "") || "Cargando misión...";

  const pendingCTA = useMemo(() => {
    if (!progress.mission_done) {
      return { 
        title: "MISIÓN ACTUAL", subtitle: missionText, icon: Star, action: () => upsertProgress.mutate({ mission_done: true }), 
        btnText: "Completar misión", color: "bg-[#F97316]", lightBg: "bg-[#FFF4E5]", textColor: "text-[#F97316]"
      };
    }
    if ((progress.water_glasses || 0) === 0) {
      return { 
        title: "TÉ PENDIENTE", subtitle: teas.find(t => t.day === currentDay)?.name || "Té de hoy", icon: Droplet, action: () => navigate({ to: "/te" }), 
        btnText: "Preparar Té", color: "bg-cyan-500", lightBg: "bg-cyan-50", textColor: "text-cyan-600"
      };
    }
    if (!progress.breakfast_done) {
      return { title: "COMIDA PENDIENTE", subtitle: "Desayuno pendiente", icon: Utensils, action: () => navigate({ to: "/plan" }), btnText: "Ver Menú", color: "bg-emerald-500", lightBg: "bg-emerald-50", textColor: "text-emerald-600" };
    }
    if (!progress.lunch_done) {
      return { title: "COMIDA PENDIENTE", subtitle: "Almuerzo pendiente", icon: Utensils, action: () => navigate({ to: "/plan" }), btnText: "Ver Menú", color: "bg-emerald-500", lightBg: "bg-emerald-50", textColor: "text-emerald-600" };
    }
    if (!progress.dinner_done) {
      return { title: "COMIDA PENDIENTE", subtitle: "Cena pendiente", icon: Utensils, action: () => navigate({ to: "/plan" }), btnText: "Ver Menú", color: "bg-emerald-500", lightBg: "bg-emerald-50", textColor: "text-emerald-600" };
    }
    if (!progress.exercise_done) {
      return { 
        title: "ENTRENAMIENTO", subtitle: "Apenas 20 minutos hoy", icon: Dumbbell, action: () => navigate({ to: "/ejercicios" }), 
        btnText: "Hacer Ejercicio", color: "bg-indigo-500", lightBg: "bg-indigo-50", textColor: "text-indigo-600"
      };
    }
    return { 
      title: "DÍA COMPLETADO", subtitle: "Excelente trabajo.\nVuelve mañana para seguir.", icon: Check, action: () => navigate({ to: "/recompensas" }), 
      btnText: "Mis recompensas", color: "bg-emerald-500", lightBg: "bg-emerald-50", textColor: "text-emerald-600", isDone: true 
    };
  }, [progress, missionText, navigate, upsertProgress, currentDay]);

  const handleMissionComplete = () => {
    upsertProgress.mutate({ mission_done: !progress.mission_done });
    if (!progress.mission_done) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const handleReset = async () => {
    if (confirm("¿Estás seguro de reiniciar todo tu progreso diario?")) {
      await supabase.from("daily_progress").delete().eq("user_id", userId);
      await supabase.from("profiles").update({ plan_started_at: new Date().toISOString() }).eq("id", userId);
      qc.invalidateQueries();
      window.location.reload();
    }
  };

  const heroMotivationalMessage = useMemo(() => {
    if (currentDay >= 21) return "¡Has completado el reto!";
    if (currentDay >= 15) return "¡Ya estás más cerca de tu meta!";
    if (currentDay >= 8) return "¡Estás construyendo nuevos hábitos!";
    return "¡Tu transformación ha comenzado!";
  }, [currentDay]);

  const currentTea = teas.find(t => t.day === currentDay) || teas[0];
  const pendingMealText = !progress.breakfast_done ? "Desayuno pendiente" : !progress.lunch_done ? "Almuerzo pendiente" : !progress.dinner_done ? "Cena pendiente" : "Comidas listas";

  const isChallengeCompleted = currentDay === 21 && pendingCTA.isDone;

  return (
    <AppShell>
      {/* 1. HEADER */}
      <header className="px-5 pt-10 pb-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-[#1A4B35] text-white shadow-sm border border-emerald-900/10">
            <span className="text-lg font-bold">{firstName[0].toUpperCase()}</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">¡Bienvenido de vuelta!</p>
            <p className="text-xl font-display font-black text-foreground leading-tight">{firstName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/progreso" className="grid h-10 w-10 place-items-center rounded-full bg-[#E5EFE8] text-[#1A4B35] transition-transform active:scale-95" title="Mi Progreso">
            <Activity className="h-5 w-5" />
          </Link>
          <Link to="/perfil" className="grid h-10 w-10 place-items-center rounded-full bg-[#E5EFE8] text-[#1A4B35] transition-transform active:scale-95" title="Mi Perfil">
            <Bell className="h-5 w-5" />
          </Link>
        </div>
      </header>

      {/* 2. HERO DE PROGRESSO */}
      <section className="px-5 mt-2 animate-in fade-in zoom-in-95 duration-700">
        <div className="rounded-[2rem] bg-[#0B3B24] p-5 shadow-lg relative overflow-hidden text-white flex flex-col gap-5">
          {isChallengeCompleted ? (
             <div className="flex flex-col items-center text-center py-4">
               <div className="h-16 w-16 bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-full grid place-items-center mb-4 shadow-lg">
                 <Target className="h-8 w-8 text-white" />
               </div>
               <h2 className="font-display text-3xl font-black mb-2">🎉 ¡Felicidades!</h2>
               <p className="text-white/90 text-sm mb-6">Has completado MiReto21.</p>
               <div className="w-full space-y-3">
                 <Link to="/recompensas" className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-sm font-bold text-slate-900 shadow-md">
                   <FileText className="h-4 w-4" /> Descargar certificado
                 </Link>
                 <button onClick={handleReset} className="flex w-full items-center justify-center gap-2 rounded-full bg-white/10 border border-white/20 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/20">
                   <RotateCcw className="h-4 w-4" /> Comenzar nuevamente
                 </button>
               </div>
             </div>
          ) : (
             <>
               <div className="flex gap-4">
                 {/* Lado Esquerdo */}
                 <div className="flex-1 flex flex-col">
                   <p className="text-[10px] font-black uppercase tracking-wider text-[#A1C9A3] mb-1">Tu Jornada</p>
                   <h2 className="font-display text-3xl font-black leading-none mb-3">
                     Día {currentDay} <span className="text-white/60 text-lg font-medium">de 21</span>
                   </h2>
                   
                   <div className="flex items-center gap-3 mb-4">
                     <div className="h-2 flex-1 bg-[#1A4B35] rounded-full overflow-hidden">
                       <div className="h-full bg-[#A1C9A3] rounded-full" style={{ width: `${planPct}%` }} />
                     </div>
                     <span className="text-xs font-bold text-white/80">{planPct}%</span>
                   </div>

                   <p className="text-[#A1C9A3] font-bold text-xs mb-1 flex items-center gap-1">
                     <Flame className="h-3.5 w-3.5 text-orange-400" /> {stats.streak} día{stats.streak !== 1 ? 's' : ''}
                   </p>
                   <p className="text-[10px] text-white/70">{heroMotivationalMessage}</p>
                 </div>

                 {/* Lado Direito - Recompensa */}
                 {firstLockedReward && (
                   <div className="w-[130px] shrink-0 bg-[#0F472D] border border-[#1A5739] rounded-2xl p-3 flex flex-col justify-between">
                     <div>
                       <p className="text-[8px] font-black uppercase text-[#A1C9A3] mb-2 leading-tight">Tu próxima recompensa</p>
                       <div className="flex items-start gap-1.5 mb-2">
                         <Gift className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                         <p className="text-[10px] font-bold leading-tight text-white/90">{firstLockedReward.name}</p>
                       </div>
                     </div>
                     <div>
                       <p className="text-[9px] font-bold text-white/70 mb-1.5">{firstLockedReward.remainingText}</p>
                       <div className="flex gap-1">
                         {/* Barras pontilhadas de progresso da recompensa */}
                         {Array.from({ length: 4 }).map((_, i) => {
                           const fill = (firstLockedReward.current / firstLockedReward.target) * 4;
                           return (
                             <div key={i} className={`h-1.5 flex-1 rounded-full ${i < fill ? 'bg-[#A1C9A3]' : 'bg-[#1A4B35]'}`} />
                           );
                         })}
                       </div>
                     </div>
                   </div>
                 )}
               </div>

               {/* Divider */}
               <div className="h-[1px] w-full bg-white/10" />

               {/* Objetivo */}
               <div className="flex items-center gap-3">
                 <div className="h-8 w-8 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                   <Target className="h-4 w-4 text-white" />
                 </div>
                 <div>
                   <p className="text-[9px] font-black uppercase text-[#A1C9A3] tracking-wider mb-0.5">Tu Objetivo</p>
                   <p className="text-xs font-medium text-white/90">
                     {remainingKg > 0 ? `Te faltan ${remainingKg} kg para alcanzar tu meta.` : '¡Has alcanzado tu meta de peso!'}
                   </p>
                 </div>
               </div>
             </>
          )}
        </div>
      </section>

      {/* 3. CARD CONTINUAR MI DÍA (Main CTA) */}
      {!isChallengeCompleted && (
        <section className="px-5 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground mb-3 px-1">Continuar Mi Día</h3>
          <div className={`rounded-[2rem] p-5 shadow-sm flex flex-col justify-between ${pendingCTA.lightBg}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`h-12 w-12 rounded-full grid place-items-center text-white shrink-0 ${pendingCTA.color} shadow-sm`}>
                <pendingCTA.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${pendingCTA.textColor}`}>{pendingCTA.title}</p>
                <h4 className="font-display font-bold text-[15px] text-foreground leading-snug">{pendingCTA.subtitle}</h4>
              </div>
              {pendingCTA.action && (
                <button 
                  onClick={pendingCTA.action}
                  className={`h-10 px-4 rounded-full font-bold text-white text-xs flex justify-center items-center gap-1.5 shadow-md active:scale-95 transition-transform shrink-0 ${pendingCTA.color}`}
                >
                  {pendingCTA.btnText} <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 4. GRADE DE FUNCIONALIDADES */}
      <section className="px-5 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <h3 className="text-xs font-black uppercase tracking-wider text-foreground mb-3 px-1">Explorar</h3>
        <div className="grid grid-cols-2 gap-3">
          <MegaCard to="/plan" image="/mi_plan_real.webp" title="Mi Plan" subtitle={pendingMealText} />
          <MegaCard to="/ejercicios" image="/ejercicios_real.webp" title="Ejercicios" subtitle="Rutina diaria" />
          <MegaCard to="/compras" image="/compras_real.webp" title="Compras" subtitle="Lista semanal" />
          <MegaCard to="/te" image={currentTea.imageUrl || "/te_real.webp"} fallbackImage="/te_real.webp" title={currentTea.name} subtitle={currentTea.category} />
          <MegaCard to="/recompensas" image="/recompensas_botao.png" title="Recompensas" subtitle={`${stats.unlockedRewards} de 8 desbloqueadas`} />
          
          <Link to={profile.subscription_plan === 'premium' ? "/analizar" : "/premium"} className="group relative flex flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-sm border border-border/40 transition-all active:scale-95" style={{ minHeight: '140px' }}>
            <div className="absolute inset-0 z-0">
              <img src="/calorias_ia_real.webp" alt="Calorías IA" className="h-full w-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            </div>
            {/* PREMIUM VIP BADGE */}
            <div className="absolute top-2 right-2 z-20 bg-amber-400 text-yellow-950 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
              <Star className="h-2.5 w-2.5 fill-yellow-950" /> Premium
            </div>
            {profile.subscription_plan !== 'premium' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 h-10 w-10 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                <Lock className="h-5 w-5 text-slate-700" />
              </div>
            )}
            <div className="relative z-10 mt-auto p-3">
              <p className="text-white font-display text-base font-black leading-tight">Calorías IA</p>
              <p className="text-white/80 text-[9px] font-medium mt-0.5 leading-tight">Analiza tu comida<br/>con inteligencia</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. MÉTRICAS GAMIFICADAS */}
      <section className="px-5 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
        <h3 className="text-xs font-black uppercase tracking-wider text-foreground mb-3 px-1">Tus Logros</h3>
        <div className="grid grid-cols-4 gap-2 mb-3">
          
          <div className="rounded-2xl bg-white border border-border/60 p-3 shadow-sm flex flex-col items-center text-center">
            <div className="h-8 w-8 rounded-full bg-orange-50 text-orange-500 grid place-items-center mb-1.5">
              <Flame className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Racha</p>
            <p className="text-sm font-black text-foreground leading-none mb-1">{stats.streak} <span className="text-[9px] font-medium">día</span></p>
            <p className="text-[8px] font-medium text-muted-foreground italic leading-tight">¡Buen comienzo!</p>
          </div>

          <div className="rounded-2xl bg-white border border-border/60 p-3 shadow-sm flex flex-col items-center text-center">
            <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-500 grid place-items-center mb-1.5">
              <Dumbbell className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Ejercicios</p>
            <p className="text-sm font-black text-foreground leading-none mb-1">{stats.exercises}<span className="text-[9px] font-medium text-muted-foreground">/21</span></p>
            <p className="text-[8px] font-medium text-muted-foreground italic leading-tight">Sigue así</p>
          </div>

          <div className="rounded-2xl bg-white border border-border/60 p-3 shadow-sm flex flex-col items-center text-center">
            <div className="h-8 w-8 rounded-full bg-cyan-50 text-cyan-500 grid place-items-center mb-1.5">
              <Droplet className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Té</p>
            <p className="text-sm font-black text-foreground leading-none mb-1">{stats.teas}<span className="text-[9px] font-medium text-muted-foreground">/21</span></p>
            <p className="text-[8px] font-medium text-muted-foreground italic leading-tight">Tu hábito diario</p>
          </div>

          <div className="rounded-2xl bg-white border border-border/60 p-3 shadow-sm flex flex-col items-center text-center">
            <div className="h-8 w-8 rounded-full bg-yellow-50 text-yellow-600 grid place-items-center mb-1.5">
              <Gift className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Recompensas</p>
            <p className="text-sm font-black text-foreground leading-none mb-1">{stats.unlockedRewards}<span className="text-[9px] font-medium text-muted-foreground">/8</span></p>
            <p className="text-[8px] font-medium text-muted-foreground italic leading-tight">Aún más por venir</p>
          </div>

        </div>
      </section>

      {/* 6. BOTTOM BANNER */}
      {firstLockedReward && (
        <section className="px-5 mt-6 mb-10">
          <div className="rounded-[1.5rem] bg-[#F4F0FB] p-4 flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 bg-[#E9DDF6] rounded-xl flex items-center justify-center text-purple-600">
                 <Gift className="h-5 w-5" />
               </div>
               <div>
                 <p className="text-[9px] font-black uppercase text-purple-700 tracking-wider mb-0.5">Próxima recompensa</p>
                 <p className="text-sm font-bold text-foreground leading-tight">{firstLockedReward.name}</p>
                 <p className="text-[10px] font-medium text-muted-foreground mt-0.5">{firstLockedReward.remainingText} para desbloquearla</p>
               </div>
             </div>
             <div className="flex gap-2 items-center">
               <div className="flex gap-0.5">
                 {Array.from({ length: 4 }).map((_, i) => {
                   const fill = (firstLockedReward.current / firstLockedReward.target) * 4;
                   return (
                     <div key={i} className={`h-1.5 w-3 rounded-full ${i < fill ? 'bg-purple-600' : 'bg-purple-200'}`} />
                   );
                 })}
               </div>
               <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                 <Lock className="h-3.5 w-3.5 text-white" />
               </div>
             </div>
          </div>
        </section>
      )}

      <div className="h-6" />
    </AppShell>
  );
}

function MegaCard({
  to, image, fallbackImage, title, subtitle
}: { to: string; image: string; fallbackImage?: string; title: string; subtitle: string; }) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-sm active:scale-95 transition-transform border border-border/40"
      style={{ minHeight: '140px' }}
    >
      <div className="absolute inset-0 z-0">
        <img 
          src={image} 
          alt={title} 
          onError={(e) => { if (fallbackImage) (e.target as HTMLImageElement).src = fallbackImage; }}
          className="h-full w-full object-cover opacity-90" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      </div>
      <div className="relative z-10 mt-auto p-3">
        <p className="text-white font-display text-base font-black leading-tight">{title}</p>
        <p className="text-white/80 text-[10px] font-medium mt-0.5 leading-tight">{subtitle}</p>
      </div>
    </Link>
  );
}
