import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles, Calendar, TrendingDown, Leaf, BookOpen } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PROGRAM_DAYS } from "@/data/program";
import { useUser } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-tea.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Programa de 21 Días para Perder Peso con Tés y Hábitos Saludables" },
      { name: "description", content: "Transforma tus hábitos en 21 días con recetas naturales de tés, seguimiento de peso y rutinas saludables." },
      { property: "og:title", content: "Programa de 21 Días — Tés y Hábitos Saludables" },
      { property: "og:description", content: "Transforma tu cuerpo en 21 días con tés naturales y hábitos saludables." },
    ],
  }),
  component: Home,
});

function Home() {
  const { user, loading } = useUser();

  const { data: progress } = useQuery({
    queryKey: ["day_progress"],
    queryFn: async () => {
      const { data } = await supabase.from("day_progress").select("day_number, completed");
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").single();
      return data;
    },
    enabled: !!user,
  });

  const completed = progress?.filter((p) => p.completed).length ?? 0;
  const currentDay = Math.min(21, completed + 1);
  const day = PROGRAM_DAYS[currentDay - 1];

  return (
    <AppShell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="relative px-5 pt-10 pb-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Bienestar natural · 21 días</p>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] text-foreground">
            Programa de 21 días para <em className="not-italic text-primary">perder peso</em>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Transforma tus hábitos, disfruta recetas naturales y acompaña tu proceso de forma saludable.
          </p>

          <div className="mt-6 overflow-hidden rounded-3xl shadow-float">
            <img src={heroImg} alt="Taza de té herbal con menta y limón" className="h-56 w-full object-cover" />
          </div>

          {!loading && !user && (
            <div className="mt-6 flex flex-col gap-2">
              <Link
                to="/auth"
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-primary font-medium text-primary-foreground shadow-soft"
              >
                <Sparkles className="h-4 w-4" /> Comenzar Programa
              </Link>
              <Link to="/recetas" className="text-center text-sm text-muted-foreground">
                Ver recetas →
              </Link>
            </div>
          )}

          {user && day && (
            <Link
              to="/_authenticated/programa/$dia"
              params={{ dia: String(currentDay) }}
              className="mt-6 block rounded-3xl bg-card p-4 shadow-float"
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Hoy · Día {currentDay} de 21</p>
              <p className="mt-1 font-display text-xl">{day.title}</p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="rounded-full bg-secondary px-2 py-1">{day.tea.emoji} {day.tea.name}</span>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Continuar <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          )}
        </div>
      </section>

      {user && (
        <section className="px-5 grid grid-cols-3 gap-2">
          <Stat label="Día" value={`${currentDay}/21`} />
          <Stat label="Peso" value={profile?.current_weight ? `${profile.current_weight}kg` : "—"} />
          <Stat label="Puntos" value={String(profile?.points ?? 0)} />
        </section>
      )}

      <section className="mt-8 px-5">
        <div className="grid grid-cols-3 gap-2">
          <ActionCard to={user ? "/_authenticated/programa" : "/auth"} icon={<Calendar />} label="Programa" />
          <ActionCard to="/recetas" icon={<BookOpen />} label="Recetas" />
          <ActionCard to={user ? "/_authenticated/progreso" : "/auth"} icon={<TrendingDown />} label="Progreso" />
        </div>
      </section>

      <section className="mt-8 px-5">
        <h2 className="mb-3 font-display text-xl">Cómo funciona</h2>
        <ol className="space-y-2">
          {[
            { n: "1", t: "Crea tu cuenta", d: "Define tu peso inicial y tu meta." },
            { n: "2", t: "Sigue tu día", d: "Cada día tienes un té, un hábito y un consejo." },
            { n: "3", t: "Marca tu checklist", d: "Acumula puntos y mantén tu racha." },
            { n: "4", t: "Mide tu progreso", d: "Visualiza tu evolución día a día." },
          ].map((s) => (
            <li key={s.n} className="flex gap-3 rounded-2xl bg-card p-4 shadow-soft">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-display text-sm text-primary-foreground">
                {s.n}
              </span>
              <div>
                <p className="text-sm font-semibold">{s.t}</p>
                <p className="text-xs text-muted-foreground">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8 px-5">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-sage-deep p-6 text-primary-foreground shadow-float">
          <Leaf className="h-6 w-6 opacity-90" />
          <h3 className="mt-3 font-display text-2xl leading-tight">100% natural · sin dietas restrictivas</h3>
          <p className="mt-2 text-sm opacity-90">
            Más de 100 recetas de tés organizadas por categoría: detox, metabolismo, ansiedad y más.
          </p>
          <Link to="/recetas" className="mt-4 inline-flex items-center gap-1 rounded-full bg-background/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
            Explorar recetas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      <footer className="mt-10 px-5 text-center text-xs text-muted-foreground">
        Hecho con 🌿 para tu bienestar
      </footer>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-3 text-center shadow-soft">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg">{value}</p>
    </div>
  );
}

function ActionCard({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 text-foreground shadow-soft transition active:scale-95"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-primary">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
