import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Sparkles, ArrowRight, Brain, CalendarCheck, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useUser } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Dashboard } from "@/components/Dashboard";

export const Route = createFileRoute("/")({
  ssr: false,
  component: HomeRoute,
});

function HomeRoute() {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (user && profile && !profile.onboarding_completed) {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [user, profile, navigate]);

  if (loading || (user && profileLoading)) {
    return (
      <AppShell hideNav>
        <div className="grid min-h-screen place-items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (!user) return <Landing />;
  if (!profile?.onboarding_completed) return null;
  return <Dashboard userId={user.id} profile={profile} />;
}

function Landing() {
  return (
    <AppShell hideNav>
      {/* HERO */}
      <section className="gradient-hero relative overflow-hidden px-5 pb-10 pt-12">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 shadow-soft">
            <span className="grid h-5 w-5 place-items-center rounded-full gradient-ai">
              <Sparkles className="h-3 w-3 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-[11px] font-semibold tracking-wide text-foreground">MIRETO21 · AI</span>
          </div>
          <Link to="/auth" className="text-xs font-medium text-muted-foreground">Entrar</Link>
        </div>

        <h1 className="mt-8 font-display text-[2.5rem] leading-[1.05] text-foreground">
          Tu transformación
          <br />
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, oklch(0.56 0.1 150), oklch(0.5 0.12 200))" }}>
            comienza hoy.
          </span>
        </h1>
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
          Plan personalizado de <span className="font-semibold text-foreground">21 días</span>, creado por Inteligencia Artificial para perder peso y construir hábitos que duran.
        </p>

        {/* Progress preview card */}
        <div className="relative mt-7 overflow-hidden rounded-3xl bg-card p-5 shadow-float">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-secondary/30 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Tu reto</p>
                <p className="mt-0.5 font-display text-xl text-foreground">Día 1 <span className="text-muted-foreground">de 21</span></p>
              </div>
              <div className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold text-primary">5%</div>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full gradient-ai" style={{ width: "5%" }} />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <div>
                <p className="text-muted-foreground">Meta</p>
                <p className="font-semibold text-foreground">-5 kg en 21 días</p>
              </div>
              <div className="flex -space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`h-6 w-6 rounded-full border-2 border-card ${i === 0 ? "bg-primary" : "bg-muted"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <Link
          to="/auth"
          className="mt-6 flex h-14 items-center justify-center gap-2 rounded-2xl gradient-ai font-semibold text-white shadow-float transition active:scale-[0.98]"
        >
          Empezar mi reto <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Personalizado · Sin gimnasio · Resultados en 21 días
        </p>
      </section>

      {/* AI FEATURES */}
      <section className="px-5 pt-2">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">¿Cómo funciona?</p>
        <div className="mt-3 space-y-3">
          <FeatureCard
            icon={<Brain className="h-5 w-5" />}
            title="Plan creado por IA"
            desc="Tu programa se adapta a tu cuerpo, objetivos y ritmo de vida."
            tone="primary"
          />
          <FeatureCard
            icon={<CalendarCheck className="h-5 w-5" />}
            title="21 días guiados"
            desc="Cada día con misión, comidas y ejercicio. Sin pensar."
            tone="secondary"
          />
          <FeatureCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="Seguimiento real"
            desc="Visualiza tu progreso día tras día. Resultados medibles."
            tone="info"
          />
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="mt-10 px-5">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Tu dashboard</p>
        <div className="mt-3 rounded-3xl bg-foreground p-1 shadow-float">
          <div className="rounded-[1.4rem] bg-card p-4">
            <div className="grid grid-cols-3 gap-2">
              <MiniStat label="Inicial" value="78kg" />
              <MiniStat label="Actual" value="76kg" highlight />
              <MiniStat label="Meta" value="73kg" />
            </div>
            <div className="mt-4 rounded-2xl bg-accent/40 p-3">
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className="text-foreground">Progreso semana 1</span>
                <span className="text-primary">62%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-card/60">
                <div className="h-full rounded-full bg-primary" style={{ width: "62%" }} />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1">
              {[1,1,1,1,0.6,0.2,0.2].map((v,i)=>(
                <div key={i} className="h-12 rounded-md bg-muted relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 bg-primary" style={{ height: `${v*100}%`, opacity: v < 1 ? 0.5 : 1 }} />
                </div>
              ))}
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">Últimos 7 días</p>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="mt-10 px-5">
        <div className="rounded-3xl gradient-ai p-6 text-white shadow-float">
          <div className="flex items-center gap-2 text-xs font-semibold opacity-90">
            <ShieldCheck className="h-4 w-4" /> SIN DIETAS RESTRICTIVAS
          </div>
          <h3 className="mt-3 font-display text-2xl leading-tight">
            Comida real. Ejercicios en casa. Hábitos que duran.
          </h3>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <Pill v="21" l="días" />
            <Pill v="100%" l="IA" />
            <Pill v="-5kg" l="promedio" />
          </div>
        </div>
      </section>

      <section className="mt-8 px-5">
        <Link
          to="/auth"
          className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-foreground font-semibold text-background shadow-soft transition active:scale-[0.98]"
        >
          <Zap className="h-4 w-4" /> Crear mi plan con IA
        </Link>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          ¿Ya tienes cuenta? <Link to="/auth" className="font-semibold text-primary">Entrar</Link>
        </p>
      </section>

      <div className="h-12" />
    </AppShell>
  );
}

function FeatureCard({
  icon, title, desc, tone,
}: { icon: React.ReactNode; title: string; desc: string; tone: "primary" | "secondary" | "info" }) {
  const toneClass =
    tone === "primary" ? "gradient-ai text-white" :
    tone === "secondary" ? "bg-secondary text-primary-foreground" :
    "bg-[color:var(--color-info)] text-white";
  return (
    <div className="flex gap-3 rounded-3xl bg-card p-4 shadow-soft">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${toneClass}`}>{icon}</span>
      <div className="flex-1 pt-0.5">
        <p className="text-[15px] font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function MiniStat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-2.5 text-center ${highlight ? "gradient-ai text-white" : "bg-muted"}`}>
      <p className={`text-[9px] uppercase tracking-widest ${highlight ? "opacity-80" : "text-muted-foreground"}`}>{label}</p>
      <p className={`mt-0.5 font-display text-base ${highlight ? "" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function Pill({ v, l }: { v: string; l: string }) {
  return (
    <div className="rounded-2xl bg-white/15 px-2 py-2 backdrop-blur">
      <p className="font-display text-xl">{v}</p>
      <p className="text-[10px] uppercase tracking-widest opacity-80">{l}</p>
    </div>
  );
}
