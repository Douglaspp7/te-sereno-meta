import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { ArrowRight, Bot, Target, BrainCircuit, CalendarDays, Activity, Droplet, CheckCircle2 } from "lucide-react";
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
      {/* HERO PREMIUM */}
      <section className="relative overflow-hidden bg-background px-6 pb-12 pt-16">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute -left-24 top-40 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        
        <div className="relative flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 shadow-sm">
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold tracking-widest text-foreground uppercase">MiReto21 AI</span>
          </div>

          <h1 className="mt-8 max-w-[280px] font-display text-[2.75rem] font-extrabold leading-[1.05] tracking-tight text-foreground">
            Tu transformación<br/>comienza hoy.
          </h1>
          
          <p className="mt-5 max-w-[300px] text-[15px] leading-relaxed text-muted-foreground">
            Un plan personalizado de 21 días creado por <span className="font-semibold text-primary">Inteligencia Artificial</span> para ayudarte a perder peso y crear hábitos duraderos.
          </p>

          <Link
            to="/auth"
            className="mt-8 flex h-14 w-full max-w-[280px] items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-white shadow-float transition-all active:scale-[0.98]"
          >
            Comenzar mi transformación <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* MOCKUP PROGRESS BAR - PWA VIBE */}
        <div className="relative mt-12 mx-auto max-w-[340px] overflow-hidden rounded-[2rem] border border-border/50 bg-white p-6 shadow-float">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Tu Reto</p>
              <p className="mt-0.5 font-display text-xl font-bold text-foreground">Día 1 <span className="font-medium text-base text-muted-foreground">de 21</span></p>
            </div>
            <div className="rounded-2xl bg-secondary/20 px-3 py-1.5">
              <span className="text-xs font-bold text-primary">5%</span>
            </div>
          </div>
          
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: "5%" }} />
          </div>
          
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border/50 bg-background p-3">
             <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm">
                <Target className="h-5 w-5 text-accent" />
             </div>
             <div>
               <p className="text-[10px] font-bold uppercase text-muted-foreground">Meta Principal</p>
               <p className="text-sm font-bold text-foreground">-5 kg en 21 días</p>
             </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="bg-white px-6 py-10">
        <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground">
          Diseñado para ti
        </h2>
        <div className="mx-auto max-w-[340px] space-y-4">
          <FeatureCard
            icon={<BrainCircuit className="h-6 w-6 text-primary" />}
            title="Plan creado por IA"
            desc="Tu programa se adapta a tus objetivos y metabolismo."
          />
          <FeatureCard
            icon={<CalendarDays className="h-6 w-6 text-primary" />}
            title="21 días guiados"
            desc="Cada día con misión, comidas y ejercicio. Sin pensar."
          />
          <FeatureCard
            icon={<Activity className="h-6 w-6 text-primary" />}
            title="Seguimiento real"
            desc="Visualiza tu progreso día tras día. Resultados reales."
          />
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="bg-background px-6 py-12">
        <div className="mx-auto max-w-[340px]">
          <h2 className="mb-2 text-center font-display text-2xl font-bold text-foreground">
            Todo en un solo lugar
          </h2>
          <p className="mb-8 text-center text-sm text-muted-foreground">Controla tu progreso diario como en los mejores apps.</p>
          
          <div className="rounded-[2rem] border border-border/50 bg-white p-5 shadow-float">
            <div className="mb-4 flex justify-between">
              <MiniStat label="Inicial" value="78kg" />
              <MiniStat label="Actual" value="76kg" highlight />
              <MiniStat label="Meta" value="73kg" />
            </div>
            
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between rounded-2xl bg-background p-3">
                 <div className="flex items-center gap-3">
                   <span className="text-xl">🍵</span>
                   <span className="text-sm font-semibold">Té del Día</span>
                 </div>
                 <span className="text-xs font-bold text-accent">Pendiente</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-background p-3">
                 <div className="flex items-center gap-3">
                   <CheckCircle2 className="h-5 w-5 text-primary" />
                   <span className="text-sm font-semibold text-muted-foreground line-through">Ejercicio</span>
                 </div>
                 <span className="text-xs font-bold text-primary">¡Hecho!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BOTTOM */}
      <section className="bg-white px-6 py-12 text-center">
        <h2 className="mb-6 font-display text-3xl font-bold text-foreground">¿Lista para cambiar?</h2>
        <Link
          to="/auth"
          className="mx-auto flex h-14 w-full max-w-[280px] items-center justify-center gap-2 rounded-2xl bg-foreground font-semibold text-background shadow-float transition-all active:scale-[0.98]"
        >
           Generar mi plan ahora <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-4 text-[13px] text-muted-foreground">
          ¿Ya tienes cuenta? <Link to="/auth" className="font-bold text-primary">Inicia sesión</Link>
        </p>
      </section>
      
      <div className="h-12 bg-white" />
    </AppShell>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4 rounded-[1.5rem] border border-border/40 bg-background p-5 shadow-sm">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary/15">
        {icon}
      </div>
      <div className="flex-1 pt-0.5">
        <p className="text-[16px] font-bold text-foreground">{title}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function MiniStat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex w-[30%] flex-col items-center justify-center rounded-2xl p-3 ${highlight ? 'bg-primary text-white shadow-soft' : 'bg-background text-foreground'}`}>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${highlight ? 'text-white/80' : 'text-muted-foreground'}`}>{label}</span>
      <span className="mt-0.5 font-display text-lg font-bold">{value}</span>
    </div>
  );
}
