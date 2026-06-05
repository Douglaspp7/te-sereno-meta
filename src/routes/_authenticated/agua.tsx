import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Droplet, Plus, Minus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useUser } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/agua")({
  component: AguaPage,
});

function AguaPage() {
  const { user } = useUser();
  const userId = user!.id;
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("plan_started_at").eq("id", userId).maybeSingle();
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

  const goal = 8;
  const water = progress?.water_glasses ?? 0;

  const update = useMutation({
    mutationFn: async (n: number) => {
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
          water_glasses: n,
        },
        { onConflict: "user_id,day_number" },
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["daily_progress", userId, currentDay] }),
  });

  return (
    <AppShell>
      <header className="px-5 pt-10 pb-2 flex items-center gap-3">
        <Link to="/" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Día {currentDay}</p>
          <h1 className="font-display text-2xl font-bold">Hidratación</h1>
        </div>
      </header>

      <section className="px-5 mt-6">
        <div className="rounded-[2rem] bg-accent text-white p-8 text-center shadow-float">
          <Droplet className="mx-auto h-12 w-12 opacity-90" />
          <p className="mt-3 font-display text-5xl font-extrabold leading-none">{water}<span className="text-2xl font-semibold text-white/70"> / {goal}</span></p>
          <p className="mt-2 text-sm text-white/80">{water * 250} ml de {goal * 250} ml</p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={() => update.mutate(Math.max(0, water - 1))} className="grid h-14 w-14 place-items-center rounded-full bg-white/20 backdrop-blur transition active:scale-95">
              <Minus className="h-5 w-5" />
            </button>
            <button onClick={() => update.mutate(Math.min(goal, water + 1))} className="grid h-16 w-16 place-items-center rounded-full bg-white text-accent transition active:scale-95 shadow-lg">
              <Plus className="h-6 w-6" strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-8 gap-2">
          {Array.from({ length: goal }).map((_, i) => (
            <div
              key={i}
              className={`aspect-[1/1.6] rounded-xl transition-all duration-300 ${i < water ? "bg-accent" : "bg-white border border-border"}`}
            />
          ))}
        </div>
      </section>

      <div className="h-10" />
    </AppShell>
  );
}
