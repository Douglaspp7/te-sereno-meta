import { createFileRoute } from "@tanstack/react-router";
import { Award, Flame, Trophy, Sparkles, Bell, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useStore, type Profile, type DayLog } from "@/lib/store";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Perfil — Tés para Bajar de Peso" }] }),
  component: Perfil,
});

function Perfil() {
  const [profile, setProfile] = useStore<Profile>("profile", {
    name: "Tu nombre",
    startWeight: 70,
    currentWeight: 70,
    goalWeight: 65,
    startDate: new Date().toISOString().slice(0, 10),
  });
  const [logs] = useStore<DayLog[]>("logs", []);
  const [points] = useStore<number>("points", 0);
  const [reminders, setReminders] = useStore<boolean>("reminders", true);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(document.documentElement.classList.contains("dark"));
  };

  const activeDays = new Set(logs.filter((l) => l.recipes.length > 0).map((l) => l.date)).size;
  const totalTeas = logs.reduce((s, l) => s + l.recipes.length, 0);

  const badges = [
    { id: "first", label: "Primer sorbo", got: totalTeas >= 1, icon: "🌱" },
    { id: "week", label: "1 semana", got: activeDays >= 7, icon: "🌿" },
    { id: "ten", label: "10 tés", got: totalTeas >= 10, icon: "🍵" },
    { id: "hundred", label: "100 puntos", got: points >= 100, icon: "🏆" },
  ];

  return (
    <AppShell>
      <PageHeader title="Mi perfil" subtitle="Tu camino hacia el bienestar" />

      <section className="px-5">
        <div className="rounded-3xl bg-card p-5 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full gradient-sage font-display text-2xl text-sage-deep">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <input
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-transparent font-display text-xl outline-none"
              />
              <p className="text-xs text-muted-foreground">Desde {profile.startDate}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 px-5">
        <Stat icon={<Flame className="h-4 w-4" />} label="Días activos" value={activeDays} />
        <Stat icon={<Trophy className="h-4 w-4" />} label="Tés consumidos" value={totalTeas} />
        <Stat icon={<Sparkles className="h-4 w-4" />} label="Puntos" value={points} />
        <Stat icon={<Award className="h-4 w-4" />} label="Peso perdido" value={`${(profile.startWeight - profile.currentWeight).toFixed(1)} kg`} />
      </section>

      <section className="mt-6 px-5">
        <h2 className="mb-3 font-display text-lg">Pesos</h2>
        <div className="grid grid-cols-3 gap-2">
          <WeightField label="Inicial" value={profile.startWeight} onChange={(v) => setProfile((p) => ({ ...p, startWeight: v }))} />
          <WeightField label="Actual" value={profile.currentWeight} onChange={(v) => setProfile((p) => ({ ...p, currentWeight: v }))} />
          <WeightField label="Meta" value={profile.goalWeight} onChange={(v) => setProfile((p) => ({ ...p, goalWeight: v }))} />
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="mb-3 font-display text-lg">Insignias</h2>
        <div className="grid grid-cols-4 gap-2">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl p-3 text-center transition ${
                b.got ? "bg-card shadow-soft" : "bg-muted/40 opacity-60"
              }`}
            >
              <div className={`text-2xl ${b.got ? "" : "grayscale"}`}>{b.icon}</div>
              <p className="mt-1 text-[10px] leading-tight">{b.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="mb-3 font-display text-lg">Preferencias</h2>
        <div className="space-y-2">
          <Toggle
            icon={<Bell className="h-4 w-4" />}
            label="Recordatorios"
            description="Beber té y registrar peso"
            value={reminders}
            onChange={setReminders}
          />
          <Toggle
            icon={dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            label="Modo oscuro"
            description="Cuida tus ojos por la noche"
            value={dark}
            onChange={toggleDark}
          />
        </div>
      </section>
    </AppShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
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

function Toggle({
  icon,
  label,
  description,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-soft"
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-secondary-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <span className={`h-6 w-10 shrink-0 rounded-full p-0.5 transition ${value ? "bg-primary" : "bg-muted"}`}>
        <span className={`block h-5 w-5 rounded-full bg-background transition ${value ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}
