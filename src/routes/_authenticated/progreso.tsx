import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/lib/auth";
import { useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Activity, Plus, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/progreso")({
  component: ProgresoPage,
});

function ProgresoPage() {
  const { user } = useUser();
  const qc = useQueryClient();
  const [weightInput, setWeightInput] = useState("");
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: allProgress } = useQuery({
    queryKey: ["daily_progress", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("daily_progress")
        .select("*")
        .eq("user_id", user!.id)
        .order("day_number", { ascending: true });
      return data || [];
    },
    enabled: !!user?.id,
  });

  const currentDay = useMemo(() => {
    if (!profile?.plan_started_at) return 1;
    const start = new Date(profile.plan_started_at);
    const today = new Date();
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(21, Math.max(1, diff + 1));
  }, [profile?.plan_started_at]);

  const updateWeight = useMutation({
    mutationFn: async (newWeight: number) => {
      if (!user) return;
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ current_weight: newWeight })
        .eq("id", user.id);
      if (profileError) throw profileError;

      const { error: progressError } = await supabase.from("daily_progress").upsert(
        {
          user_id: user.id,
          day_number: currentDay,
          log_date: new Date().toISOString().slice(0, 10),
          weight: newWeight,
        },
        { onConflict: "user_id,day_number" }
      );
      if (progressError) throw progressError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["daily_progress", user?.id] });
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
      setIsWeightModalOpen(false);
      setWeightInput("");
    },
  });

  const chartData = useMemo(() => {
    let data = [];
    if (profile?.start_weight) {
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
  }, [profile?.start_weight, allProgress]);

  const imcData = useMemo(() => {
    if (!profile?.current_weight || !profile?.height_cm) return null;
    const heightM = profile.height_cm / 100;
    const imc = profile.current_weight / (heightM * heightM);
    let label = "";
    let color = "";
    
    if (imc < 18.5) { label = "Bajo Peso"; color = "text-blue-500 bg-blue-100"; }
    else if (imc >= 18.5 && imc < 24.9) { label = "Peso Normal"; color = "text-green-500 bg-green-100"; }
    else if (imc >= 25 && imc < 29.9) { label = "Sobrepeso"; color = "text-orange-500 bg-orange-100"; }
    else { label = "Obesidad"; color = "text-red-500 bg-red-100"; }
    
    return { value: imc.toFixed(1), label, color };
  }, [profile?.current_weight, profile?.height_cm]);

  const lostKg = profile?.start_weight && profile?.current_weight
    ? Math.max(0, profile.start_weight - profile.current_weight)
    : 0;

  if (isProfileLoading || !profile) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <AppShell>
      <PageHeader title="Mi Progreso" subtitle="Análisis de tu evolución." />
      <div className="px-5 mt-4 space-y-6 pb-20">

        {/* STATS HIGHLIGHT */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-3xl bg-primary/10 border border-primary/20 p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Has perdido</p>
            <h2 className="text-3xl font-display font-black text-primary flex items-center justify-center gap-1">
              <TrendingDown className="h-6 w-6" /> {lostKg.toFixed(1)} <span className="text-sm">kg</span>
            </h2>
          </div>
          <div className="rounded-3xl bg-secondary/50 border border-border/50 p-5 text-center flex flex-col items-center justify-center">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">IMC</p>
            {imcData ? (
              <>
                <h2 className="text-2xl font-display font-black text-foreground">{imcData.value}</h2>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 ${imcData.color}`}>
                  {imcData.label}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-muted-foreground">—</span>
            )}
          </div>
        </div>

        {/* CHART SECTION */}
        <div className="rounded-[2rem] bg-white border border-border/40 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Evolución de Peso
            </h3>
            <Dialog open={isWeightModalOpen} onOpenChange={setIsWeightModalOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors">
                  <Plus className="h-3 w-3" /> Añadir
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
                    {updateWeight.isPending ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="h-[200px] w-full">
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 15, right: 0, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorWeightProg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <YAxis domain={['dataMin - 1.5', 'dataMax + 1.5']} hide />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: 'bold' }}
                    itemStyle={{ color: '#10b981' }}
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
                    stroke="#10b981" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorWeightProg)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-border rounded-2xl bg-secondary/20">
                <p className="text-sm font-semibold text-muted-foreground text-center">
                  Añade tu peso de hoy para<br/>ver tu curva de progreso.
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-between bg-secondary/30 rounded-2xl p-4">
            <div className="text-center w-1/3">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Inicial</p>
              <p className="text-lg font-bold text-foreground leading-none">{profile.start_weight || "—"} <span className="text-[10px] font-normal text-muted-foreground">kg</span></p>
            </div>
            <div className="text-center w-1/3 border-x border-border/50">
              <p className="text-[10px] uppercase font-bold text-primary tracking-wider mb-1">Actual</p>
              <p className="text-lg font-bold text-foreground leading-none">{profile.current_weight || "—"} <span className="text-[10px] font-normal text-muted-foreground">kg</span></p>
            </div>
            <div className="text-center w-1/3">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Objetivo</p>
              <p className="text-lg font-bold text-foreground leading-none">{profile.goal_weight || "—"} <span className="text-[10px] font-normal text-muted-foreground">kg</span></p>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
