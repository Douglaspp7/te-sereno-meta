import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowRight, Bot, Target, BrainCircuit, CalendarDays, Activity, Droplet, CheckCircle2, Mail } from "lucide-react";
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
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Algo salió mal.";
      alert(translateError(msg)); // Simplified toast for now, can add sonner if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell hideNav>
      <section className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-background px-6">
        {/* Dynamic Background Elements */}
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute -left-24 top-40 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative w-full max-w-[340px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-soft border border-border/50 text-primary">
              {sent ? <CheckCircle2 className="h-8 w-8" /> : <Bot className="h-8 w-8" />}
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
              {sent ? "Revisa tu correo" : "MiReto21 AI"}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {sent
                ? `Te enviamos un enlace a ${email}. Ábrelo para entrar automáticamente.`
                : "Ingresa tu correo para comenzar tu transformación de 21 días."}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={submit} className="w-full space-y-4">
              <div className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-white/60 px-4 py-3.5 shadow-sm backdrop-blur-md transition-all focus-within:border-primary focus-within:bg-white focus-within:shadow-md">
                <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  className="w-full bg-transparent text-[15px] font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground/70"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-foreground font-semibold text-background shadow-float transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />}
                Continuar
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="mt-6 w-full text-center text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Usar otro correo
            </button>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function translateError(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("rate limit") || m.includes("too many")) return "Demasiados intentos. Intenta en unos minutos.";
  if (m.includes("invalid email")) return "Correo inválido.";
  if (m.includes("signups not allowed")) return "Los registros están desactivados.";
  return msg;
}
