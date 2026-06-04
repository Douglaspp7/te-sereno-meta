import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { TrendingDown, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/progreso")({
  head: () => ({ meta: [{ title: "Mi progreso — Programa 21 Días" }] }),
  component: Progreso,
});

const HABITS = [
  { key: "drank_tea", label: "Bebí mi té" },
  { key: "drank_water", label: "Tomé suficiente agua" },
  { key: "walked", label: "Caminé hoy" },
  { key: "no_sugar", label: "Evité bebidas azucaradas" },
  { key: "slept_well", label: "Dormí bien" },
] as const;

const today = () => new Date().toISOString().slice(0, 10);

function Progreso() {
  const qc = useQueryClient();
  const [newWeight, setNewWeight] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").single();
      return data;
    },
  });

  const { data: weights } = useQuery({
    queryKey: ["weight_logs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("weight_logs")
        .select("weight, logged_at")
        .order("logged_at", { ascending: true });
      return data ?? [];
    },
  });

  const { data: habitToday } = useQuery({
    queryKey: ["habit_logs", today()],
    queryFn: async () => {
      const { data } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("log_date", today())
        .maybeSingle();
      return data;
    },
  });

  const { data: habitWeek } = useQuery({
    queryKey: ["habit_logs_week"],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - 6);
      const { data } = await supabase
        .from("habit_logs")
        .select("*")
        .gte("log_date", since.toISOString().slice(0, 10));
      return data ?? [];
    },
  });

  const startW = profile?.start_weight ?? 0;
  const goalW = profile?.goal_weight ?? 0;
  const currentW = profile?.current_weight ?? startW;
  const total = startW - goalW;
  const done = startW - currentW;
  const pct = total > 0 ? Math.max(0, Math.min(100, (done / total) * 100)) : 0;

  const addWeight = async () => {
    const w = parseFloat(newWeight);
    if (!w || w < 20 || w > 300) {
      toast.error("Ingresa un peso válido (kg)");
      return;
    }
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    await supabase.from("weight_logs").insert({ user_id: user.user.id, weight: w });
    if (!profile?.start_weight) {
      await supabase.from("profiles").update({ current_weight: w, start_weight: w }).eq("id", user.user.id);
    } else {
      await supabase.from("profiles").update({ current_weight: w }).eq("id", user.user.id);
    }
    setNewWeight("");
    qc.invalidateQueries({ queryKey: ["weight_logs"] });
    qc.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Peso registrado");
  };

  const toggleHabit = async (key: string) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const current = habitToday?.[key as keyof typeof habitToday];
    const payload = {
      user_id: user.user.id,
      log_date: today(),
      ...(habitToday ?? {}),
      [key]: !current,
    };
    delete (payload as { id?: string }).id;
    delete (payload as { created_at?: string }).created_at;
    delete (payload as { updated_at?: string }).updated_at;
    await supabase.from("habit_logs").upsert(payload, { onConflict: "user_id,log_date" });
    qc.invalidateQueries({ queryKey: ["habit_logs", today()] });
    qc.invalidateQueries({ queryKey: ["habit_logs_week"] });
  };

  const chartData =
    weights?.map((w) => ({ date: w.logged_at.slice(5), weight: Number(w.weight) })) ?? [];

  const weekStats = HABITS.map((h) => {
    const count = (habitWeek ?? []).filter((l) => l[h.key as keyof typeof l]).length;
    return { ...h, count };
  });

  return (
    <AppShell>
      <PageHeader title="Mi progreso" subtitle="Tu evolución día a día" />

      <section className="px-5">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-sage-deep p-5 text-primary-foreground shadow-float">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-80">Progreso de peso</p>
              <p className="mt-1 font-display text-3xl">{Math.round(pct)}%</p>
            </div>
            <TrendingDown className="h-6 w-6 opacity-90" />
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/20">
            <div className="h-full bg-background transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-3 flex justify-between text-xs opacity-90">
            <span>Inicial: {startW || "—"} kg</span>
            <span>Actual: {currentW || "—"} kg</span>
            <span>Meta: {goalW || "—"} kg</span>
          </div>
        </div>
      </section>

      <section className="mt-5 px-5">
        <div className="rounded-2xl bg-card p-4 shadow-soft">
          <h2 className="mb-3 font-display text-lg">Registrar peso de hoy</h2>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="65.5"
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={addWeight}
              className="flex items-center gap-1 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Añadir
            </button>
          </div>
        </div>
      </section>

      {chartData.length > 0 && (
        <section className="mt-5 px-5">
          <div className="rounded-2xl bg-card p-4 shadow-soft">
            <h2 className="mb-2 font-display text-lg">Evolución</h2>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      <section className="mt-6 px-5">
        <h2 className="mb-3 font-display text-lg">Hábitos de hoy</h2>
        <div className="space-y-2">
          {HABITS.map((h) => {
            const v = !!habitToday?.[h.key as keyof typeof habitToday];
            return (
              <button
                key={h.key}
                onClick={() => toggleHabit(h.key)}
                className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-soft"
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition ${
                    v ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  }`}
                >
                  {v && <span className="text-xs">✓</span>}
                </span>
                <span className={`text-sm ${v ? "text-muted-foreground line-through" : ""}`}>{h.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="mb-3 font-display text-lg">Esta semana</h2>
        <div className="space-y-2">
          {weekStats.map((s) => (
            <div key={s.key} className="rounded-2xl bg-card p-3 shadow-soft">
              <div className="flex justify-between text-xs">
                <span>{s.label}</span>
                <span className="font-medium">{s.count}/7</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${(s.count / 7) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
