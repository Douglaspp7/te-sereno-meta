import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Check, TrendingDown, Award } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { RECIPES, getRecipe } from "@/data/recipes";
import { useStore, today, type DayLog, type Profile } from "@/lib/store";

const MOTIVATIONS = [
  "¡Excelente trabajo! Cada día cuenta.",
  "Sigue avanzando hacia tu meta. 🌿",
  "Tu cuerpo te lo agradece.",
  "Un sorbo más cerca de tu bienestar.",
  "La constancia es tu mejor aliada.",
];

export const Route = createFileRoute("/plan")({
  head: () => ({ meta: [{ title: "Plan diario — Tés para Bajar de Peso" }] }),
  component: PlanPage,
});

function PlanPage() {
  const [logs, setLogs] = useStore<DayLog[]>("logs", []);
  const [profile, setProfile] = useStore<Profile>("profile", {
    name: "Tu nombre",
    startWeight: 70,
    currentWeight: 70,
    goalWeight: 65,
    startDate: today(),
  });
  const [points] = useStore<number>("points", 0);

  const todayDate = today();
  const todayLog = logs.find((l) => l.date === todayDate);
  const consumedToday = todayLog?.recipes ?? [];

  const progress = useMemo(() => {
    const total = profile.startWeight - profile.goalWeight;
    const done = profile.startWeight - profile.currentWeight;
    if (total <= 0) return 0;
    return Math.max(0, Math.min(100, (done / total) * 100));
  }, [profile]);

  const motivation = MOTIVATIONS[new Date().getDate() % MOTIVATIONS.length];
  const suggested = RECIPES.slice(0, 4);

  const updateWeight = (val: number) => setProfile((p) => ({ ...p, currentWeight: val }));
  const updateGoal = (val: number) => setProfile((p) => ({ ...p, goalWeight: val }));

  const toggleRecipe = (id: string) => {
    setLogs((prev) => {
      const others = prev.filter((l) => l.date !== todayDate);
      const current = todayLog ?? { date: todayDate, recipes: [] };
      const recipes = current.recipes.includes(id)
        ? current.recipes.filter((r) => r !== id)
        : [...current.recipes, id];
      return [...others, { ...current, recipes }];
    });
  };

  return (
    <AppShell>
      <PageHeader title="Plan diario" subtitle={motivation} />

      <section className="px-5">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-sage-deep p-5 text-primary-foreground shadow-float">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-80">Progreso</p>
              <p className="mt-1 font-display text-3xl">{Math.round(progress)}%</p>
            </div>
            <Award className="h-6 w-6 opacity-90" />
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/20">
            <div className="h-full bg-background transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-3 flex justify-between text-xs opacity-90">
            <span>{profile.currentWeight} kg actual</span>
            <span>Meta: {profile.goalWeight} kg</span>
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3 px-5">
        <NumberCard label="Peso actual" value={profile.currentWeight} onChange={updateWeight} suffix="kg" />
        <NumberCard label="Meta" value={profile.goalWeight} onChange={updateGoal} suffix="kg" />
      </section>

      <section className="mt-5 px-5">
        <div className="rounded-2xl bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Hoy llevas</p>
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
              {consumedToday.length} tés · {points} pts
            </span>
          </div>
          {consumedToday.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {consumedToday.map((id) => {
                const r = getRecipe(id);
                return r ? (
                  <div key={id} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary" /> {r.name}
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="mb-3 font-display text-xl">Sugerencias de hoy</h2>
        <div className="space-y-2">
          {suggested.map((r) => {
            const done = consumedToday.includes(r.id);
            return (
              <div key={r.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft">
                <button
                  onClick={() => toggleRecipe(r.id)}
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition ${
                    done ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  }`}
                  aria-label={done ? "Desmarcar" : "Marcar como consumido"}
                >
                  {done && <Check className="h-4 w-4" />}
                </button>
                <Link to="/recetas/$id" params={{ id: r.id }} className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${done ? "text-muted-foreground line-through" : ""}`}>
                    {r.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{r.schedule}</p>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 px-5">
        <div className="rounded-2xl border border-dashed border-primary/40 bg-secondary/40 p-4 text-sm">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <TrendingDown className="h-4 w-4 text-primary" />
            Tip de hoy
          </div>
          <p className="mt-1 text-muted-foreground">
            Bebe un vaso de agua entre cada té para potenciar la depuración natural.
          </p>
        </div>
      </section>
    </AppShell>
  );
}

function NumberCard({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block rounded-2xl bg-card p-4 shadow-soft">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-baseline gap-1">
        <input
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-20 bg-transparent font-display text-2xl outline-none"
        />
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </label>
  );
}
