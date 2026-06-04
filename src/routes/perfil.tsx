import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Award, Flame, Trophy, Sparkles, LogOut, Moon, Sun, User as UserIcon, Lock } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Perfil — Programa 21 Días" }] }),
  component: Perfil,
});

const LEVELS = [
  { min: 0, name: "Principiante", emoji: "🌱" },
  { min: 100, name: "Comprometido", emoji: "🌿" },
  { min: 300, name: "Constante", emoji: "🍵" },
  { min: 600, name: "Transformación", emoji: "✨" },
  { min: 1000, name: "Maestro del Programa", emoji: "🏆" },
];

function Perfil() {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(document.documentElement.classList.contains("dark"));
  };

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").single();
      return data;
    },
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["profile_stats"],
    queryFn: async () => {
      const [days, habits] = await Promise.all([
        supabase.from("day_progress").select("completed").eq("completed", true),
        supabase.from("habit_logs").select("drank_tea"),
      ]);
      const completedDays = days.data?.length ?? 0;
      const teaCount = (habits.data ?? []).filter((h) => h.drank_tea).length;
      return { completedDays, teaCount };
    },
    enabled: !!user,
  });

  if (loading) return null;

  if (!user) {
    return (
      <AppShell>
        <PageHeader title="Mi perfil" />
        <div className="px-5 text-center">
          <div className="rounded-3xl bg-card p-8 shadow-soft">
            <UserIcon className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-display text-lg">Inicia sesión</p>
            <p className="mt-1 text-sm text-muted-foreground">Accede para ver tu progreso y guardar tus datos.</p>
            <Link
              to="/auth"
              className="mt-5 inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              Iniciar sesión / Registrarse
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const points = profile?.points ?? 0;
  const level = [...LEVELS].reverse().find((l) => points >= l.min) ?? LEVELS[0];
  const nextLevel = LEVELS.find((l) => l.min > points);

  const badges = [
    { id: "first", label: "Primer día", got: (stats?.completedDays ?? 0) >= 1, icon: "🌱" },
    { id: "week", label: "1 semana", got: (stats?.completedDays ?? 0) >= 7, icon: "🌿" },
    { id: "two_weeks", label: "2 semanas", got: (stats?.completedDays ?? 0) >= 14, icon: "🍵" },
    { id: "complete", label: "21 días", got: (stats?.completedDays ?? 0) >= 21, icon: "🏆" },
  ];

  const updateProfile = async (patch: { display_name?: string; start_weight?: number; current_weight?: number; goal_weight?: number }) => {
    await supabase.from("profiles").update(patch).eq("id", user.id);
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <AppShell>
      <PageHeader title="Mi perfil" subtitle="Tu camino hacia el bienestar" />

      <section className="px-5">
        <div className="rounded-3xl bg-card p-5 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full gradient-sage font-display text-2xl text-sage-deep">
              {(profile?.display_name ?? "U").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <input
                value={profile?.display_name ?? ""}
                onChange={(e) => updateProfile({ display_name: e.target.value })}
                className="w-full bg-transparent font-display text-xl outline-none"
                placeholder="Tu nombre"
              />
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 px-5">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-sage-deep p-5 text-primary-foreground shadow-float">
          <p className="text-xs uppercase tracking-widest opacity-80">Nivel actual</p>
          <p className="mt-1 font-display text-2xl">{level.emoji} {level.name}</p>
          <div className="mt-3 flex items-center justify-between text-xs opacity-90">
            <span>{points} puntos</span>
            {nextLevel && <span>Próximo: {nextLevel.name} ({nextLevel.min}pts)</span>}
          </div>
          {nextLevel && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/20">
              <div
                className="h-full bg-background"
                style={{ width: `${Math.min(100, ((points - level.min) / (nextLevel.min - level.min)) * 100)}%` }}
              />
            </div>
          )}
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 px-5">
        <Stat icon={<Flame className="h-4 w-4" />} label="Días completados" value={String(stats?.completedDays ?? 0)} />
        <Stat icon={<Trophy className="h-4 w-4" />} label="Tés consumidos" value={String(stats?.teaCount ?? 0)} />
        <Stat icon={<Sparkles className="h-4 w-4" />} label="Puntos" value={String(points)} />
        <Stat
          icon={<Award className="h-4 w-4" />}
          label="Peso perdido"
          value={`${Math.max(0, (profile?.start_weight ?? 0) - (profile?.current_weight ?? 0)).toFixed(1)} kg`}
        />
      </section>

      <section className="mt-6 px-5">
        <h2 className="mb-3 font-display text-lg">Mis pesos</h2>
        <div className="grid grid-cols-3 gap-2">
          <WeightField label="Inicial" value={profile?.start_weight ?? 0} onChange={(v) => updateProfile({ start_weight: v })} />
          <WeightField label="Actual" value={profile?.current_weight ?? 0} onChange={(v) => updateProfile({ current_weight: v })} />
          <WeightField label="Meta" value={profile?.goal_weight ?? 0} onChange={(v) => updateProfile({ goal_weight: v })} />
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="mb-3 font-display text-lg">Insignias</h2>
        <div className="grid grid-cols-4 gap-2">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl p-3 text-center transition ${b.got ? "bg-card shadow-soft" : "bg-muted/40 opacity-60"}`}
            >
              <div className={`text-2xl ${b.got ? "" : "grayscale"}`}>{b.icon}</div>
              <p className="mt-1 text-[10px] leading-tight">{b.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="mb-3 font-display text-lg">Premium</h2>
        <div className="rounded-2xl bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Acceso completo</p>
                <p className="text-xs text-muted-foreground">
                  {profile?.premium_access ? "Activo · todos los programas" : "Bloqueado · adquiere en Hotmart"}
                </p>
              </div>
            </div>
            {!profile?.premium_access && (
              <Link to="/premium" className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                Ver
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 space-y-2 px-5">
        <button
          onClick={toggleDark}
          className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-soft"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary">
            {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </span>
          <span className="flex-1 text-sm font-medium">Modo oscuro</span>
          <span className={`h-6 w-10 rounded-full p-0.5 transition ${dark ? "bg-primary" : "bg-muted"}`}>
            <span className={`block h-5 w-5 rounded-full bg-background transition ${dark ? "translate-x-4" : ""}`} />
          </span>
        </button>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left text-destructive shadow-soft"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-destructive/10">
            <LogOut className="h-4 w-4" />
          </span>
          <span className="text-sm font-medium">Cerrar sesión</span>
        </button>
      </section>
    </AppShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-soft">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon} {label}</div>
      <div className="mt-1 font-display text-2xl">{value}</div>
    </div>
  );
}

function WeightField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="rounded-2xl bg-card p-3 shadow-soft">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1">
        <input
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full bg-transparent font-display text-lg outline-none"
        />
        <span className="text-xs text-muted-foreground">kg</span>
      </div>
    </label>
  );
}
