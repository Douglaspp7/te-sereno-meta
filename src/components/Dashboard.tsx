import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check, Sparkles, UtensilsCrossed, Dumbbell, BookOpen, ShoppingCart, Droplet, TrendingUp, Camera, User as UserIcon, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "./AppShell";
import { getDayContent } from "@/lib/content/days";

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

  const planPct = Math.round((currentDay / 21) * 100);
  const firstName = profile.display_name?.split(" ")[0] ?? "";
  const dayContent = getDayContent(currentDay);
  const missionText = dayContent.mission.replace(/^[^\w\s]+\s/, "");
  const lostKg =
    profile.start_weight && profile.current_weight
      ? Math.max(0, profile.start_weight - profile.current_weight)
      : 0;

  return (
    <AppShell>
      {/* HEADER */}
      <header className="px-5 pt-10 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-white">
            <span className="text-sm font-bold">{(firstName[0] || "U").toUpperCase()}</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Hola</p>
            <p className="text-base font-bold text-foreground leading-tight">{firstName || "amig@"} 👋</p>
          </div>
        </div>
        <Link to="/auth" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white">
          <UserIcon className="h-4 w-4 text-foreground" />
        </Link>
      </header>

      {/* PROGRESS CARD */}
      <section className="px-5">
        <div className="rounded-[1.75rem] bg-primary text-white p-5 shadow-float">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">Tu Reto</p>
              <p className="mt-1 font-display text-3xl font-extrabold leading-none">
                Día {currentDay} <span className="text-base font-semibold text-white/70">de 21</span>
              </p>
            </div>
            <div className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">
              <span className="text-xs font-bold">{planPct}%</span>
            </div>
          </div>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{ width: `${planPct}%` }}
            />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <MiniStat label="Inicial" value={profile.start_weight ? `${profile.start_weight}` : "—"} unit="kg" />
            <MiniStat label="Actual" value={profile.current_weight ? `${profile.current_weight}` : "—"} unit="kg" big />
            <MiniStat label="Meta" value={profile.goal_weight ? `${profile.goal_weight}` : "—"} unit="kg" />
          </div>
        </div>

        {lostKg > 0 && (
          <div className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-secondary/15 px-3 py-2 text-xs font-bold text-primary border border-border/40">
            <Flame className="h-4 w-4" /> Has perdido {lostKg.toFixed(1)} kg
          </div>
        )}
      </section>

      {/* MISSION CARD */}
      <section className="mt-5 px-5">
        <button
          onClick={() => upsertProgress.mutate({ mission_done: !progress?.mission_done })}
          className={`relative w-full overflow-hidden rounded-[1.5rem] border border-border/50 bg-white p-5 text-left shadow-sm transition active:scale-[0.99]`}
        >
          <div className="flex items-center gap-4">
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${progress?.mission_done ? "bg-muted text-muted-foreground" : "bg-secondary/15 text-primary"}`}>
              <Sparkles className="h-6 w-6" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Misión de hoy</p>
              <p className={`text-[15px] font-bold leading-snug ${progress?.mission_done ? "text-muted-foreground line-through opacity-60" : "text-foreground"}`}>
                {missionText}
              </p>
            </div>
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition-all ${progress?.mission_done ? "border-primary bg-primary text-white" : "border-border bg-background"}`}>
              {progress?.mission_done && <Check className="h-4 w-4" strokeWidth={3} />}
            </span>
          </div>
        </button>
      </section>

      {/* MEGA GRID */}
      <section className="mt-6 px-5">
        <div className="grid grid-cols-2 gap-3">
          <MegaCard to="/alimentacion" icon={<UtensilsCrossed className="h-7 w-7" />} title="Alimentación" subtitle="Comidas del día" tint="primary" />
          <MegaCard to="/ejercicios" icon={<Dumbbell className="h-7 w-7" />} title="Ejercicios" subtitle="Tu rutina diaria" tint="accent" />
          <MegaCard to="/recetas" icon={<BookOpen className="h-7 w-7" />} title="Recetas" subtitle="Paso a paso" tint="primary" />
          <MegaCard to="/compras" icon={<ShoppingCart className="h-7 w-7" />} title="Compras" subtitle="Por semana" tint="accent" />
          <MegaCard to="/agua" icon={<Droplet className="h-7 w-7" />} title="Agua" subtitle={`${progress?.water_glasses ?? 0}/8 vasos`} tint="accent" />
          <MegaCard to="/progreso" icon={<TrendingUp className="h-7 w-7" />} title="Progreso" subtitle="Tu evolución" tint="primary" />
        </div>

        <Link
          to="/analizar"
          className="mt-3 flex h-[88px] w-full items-center justify-center gap-3 rounded-[1.5rem] bg-foreground text-background shadow-float transition active:scale-[0.99]"
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-background/10">
            <Camera className="h-6 w-6" />
          </span>
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-background/60">Premium IA</p>
            <p className="text-[17px] font-bold leading-tight">Analizar Comida</p>
          </div>
        </Link>
      </section>

      <div className="h-10" />
    </AppShell>
  );
}

function MiniStat({ label, value, unit, big = false }: { label: string; value: string; unit?: string; big?: boolean }) {
  return (
    <div className={`rounded-2xl p-2.5 ${big ? "bg-white/15" : ""}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">{label}</p>
      <p className="mt-0.5 font-display text-lg font-bold leading-none">
        {value}<span className="ml-0.5 text-[10px] font-semibold text-white/70">{unit}</span>
      </p>
    </div>
  );
}

function MegaCard({
  to, icon, title, subtitle, tint,
}: { to: string; icon: React.ReactNode; title: string; subtitle: string; tint: "primary" | "accent" }) {
  const iconBg = tint === "primary" ? "bg-secondary/15 text-primary" : "bg-accent/10 text-accent";
  return (
    <Link
      to={to}
      className="group flex min-h-[130px] flex-col justify-between rounded-[1.5rem] border border-border/50 bg-white p-4 shadow-sm transition active:scale-[0.98]"
    >
      <span className={`grid h-12 w-12 place-items-center rounded-2xl ${iconBg}`}>
        {icon}
      </span>
      <div>
        <p className="text-[16px] font-bold text-foreground leading-tight">{title}</p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</p>
      </div>
    </Link>
  );
}
