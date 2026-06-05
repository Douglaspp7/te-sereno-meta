import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Sparkles, ArrowRight, CheckCircle2, Brain, Calendar, Target } from "lucide-react";
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
      <div className="px-5 pt-12 pb-10">
        <div className="flex items-center gap-2 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" /> MIRETO21 AI
        </div>
        <h1 className="mt-6 font-display text-4xl leading-[1.05] text-foreground">
          Tu plan de <em className="text-primary not-italic">21 días</em> creado por Inteligencia Artificial.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Pierde peso siguiendo un plan diseñado especialmente para ti.
          Comidas, ejercicios y hábitos, día a día. Sin pensar.
        </p>

        <Link
          to="/auth"
          className="mt-8 flex h-12 items-center justify-center gap-2 rounded-full bg-primary font-medium text-primary-foreground shadow-soft"
        >
          Empezar mi reto <ArrowRight className="h-4 w-4" />
        </Link>

        <div className="mt-10 space-y-3">
          <Feature icon={<Brain className="h-5 w-5" />} title="Plan personalizado con IA" desc="Adaptado a tu cuerpo, hábitos y objetivos." />
          <Feature icon={<Calendar className="h-5 w-5" />} title="21 días estructurados" desc="Cada día con misión, comidas y ejercicio." />
          <Feature icon={<Target className="h-5 w-5" />} title="Resultados reales" desc="Sigue el plan, marca tu progreso, ve tus cambios." />
        </div>

        <div className="mt-10 rounded-3xl bg-gradient-to-br from-primary to-sage-deep p-6 text-primary-foreground shadow-float">
          <CheckCircle2 className="h-6 w-6 opacity-90" />
          <h3 className="mt-3 font-display text-2xl leading-tight">Sin dietas restrictivas, sin gimnasio.</h3>
          <p className="mt-2 text-sm opacity-90">Comida real, ejercicios en casa, hábitos sostenibles.</p>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link to="/auth" className="font-medium text-primary">Entrar</Link>
        </p>
      </div>
    </AppShell>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-card p-4 shadow-soft">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-primary">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
