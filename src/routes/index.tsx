import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Heart, Calendar, Flame, Trophy } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CATEGORIES, RECIPES } from "@/data/recipes";
import { useStore, today, type DayLog } from "@/lib/store";
import heroImg from "@/assets/hero-tea.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tés para Bajar de Peso — Recetas naturales de bienestar" },
      { name: "description", content: "Más de 100 recetas naturales de tés e infusiones para complementar una vida saludable, perder peso y sentirte mejor cada día." },
      { property: "og:title", content: "Tés para Bajar de Peso" },
      { property: "og:description", content: "Más de 100 recetas naturales para complementar una vida saludable." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Home,
});

function Home() {
  const [favs] = useStore<string[]>("favorites", []);
  const [logs] = useStore<DayLog[]>("logs", []);
  const todayLog = logs.find((l) => l.date === today());
  const streak = computeStreak(logs);

  return (
    <AppShell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="relative px-5 pt-10 pb-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Bienestar natural</p>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] text-foreground">
            Tés para <em className="not-italic text-primary">bajar de peso</em>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Más de 100 recetas naturales para complementar una vida saludable.
          </p>

          <div className="mt-6 overflow-hidden rounded-3xl shadow-float">
            <img src={heroImg} alt="Taza de té herbal con menta y limón" width={1280} height={1280} className="h-56 w-full object-cover" />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            <Link to="/recetas" className="flex flex-col items-center gap-1 rounded-2xl bg-primary px-3 py-4 text-primary-foreground shadow-soft transition active:scale-95">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-medium">Ver recetas</span>
            </Link>
            <Link to="/favoritos" className="flex flex-col items-center gap-1 rounded-2xl bg-card px-3 py-4 text-foreground shadow-soft transition active:scale-95">
              <Heart className="h-5 w-5 text-destructive" />
              <span className="text-xs font-medium">Favoritos</span>
            </Link>
            <Link to="/plan" className="flex flex-col items-center gap-1 rounded-2xl bg-card px-3 py-4 text-foreground shadow-soft transition active:scale-95">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Plan diario</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 mt-2">
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<Flame className="h-4 w-4" />} label="Racha" value={`${streak} días`} />
          <StatCard icon={<Trophy className="h-4 w-4" />} label="Hoy" value={`${todayLog?.recipes.length ?? 0} tés`} />
        </div>
      </section>

      <section className="mt-8 px-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground">Categorías</h2>
          <Link to="/recetas" className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              to="/recetas"
              search={{ cat: cat.id }}
              className="group relative overflow-hidden rounded-2xl bg-card p-4 shadow-soft transition active:scale-95"
            >
              <div
                className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-60"
                style={{ background: cat.color }}
              />
              <span className="relative text-2xl">{cat.emoji}</span>
              <h3 className="relative mt-2 text-sm font-semibold leading-tight text-foreground">{cat.name}</h3>
              <p className="relative mt-1 text-[11px] text-muted-foreground">
                {RECIPES.filter((r) => r.category === cat.id).length} recetas
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 px-5">
        <Link to="/premium" className="block overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-sage-deep p-6 text-primary-foreground shadow-float">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-80">Plan Premium</p>
              <h3 className="mt-2 font-display text-2xl leading-tight">21 días para transformar tu rutina</h3>
              <p className="mt-2 text-sm opacity-90">Recetas exclusivas, calendario y lista de compras.</p>
            </div>
            <Sparkles className="h-6 w-6 opacity-90" />
          </div>
          <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-background/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
            Desbloquear premium <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      </section>

      <footer className="mt-10 px-5 text-center text-xs text-muted-foreground">
        Hecho con 🌿 para tu bienestar
      </footer>
    </AppShell>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-soft">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon} {label}</div>
      <div className="mt-1 font-display text-2xl text-foreground">{value}</div>
    </div>
  );
}

function computeStreak(logs: DayLog[]): number {
  if (!logs.length) return 0;
  const dates = new Set(logs.filter((l) => l.recipes.length > 0).map((l) => l.date));
  let streak = 0;
  const d = new Date();
  while (dates.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
