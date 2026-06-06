import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowRight, Bot, Target, BrainCircuit, CalendarDays, Activity, Droplet, CheckCircle2, Mail } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useUser } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Dashboard } from "@/components/Dashboard";
import { InstallApp } from "@/components/InstallApp";

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
        <div className="grid min-h-screen place-items-center bg-black">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/50 border-t-white" />
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
  const [otp, setOtp] = useState("");

  const submitEmail = async (e: React.FormEvent) => {
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
      alert(translateError(msg)); 
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (error) throw error;
      // User is now logged in, the `useUser` hook will detect the session change
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Código incorrecto.";
      alert(translateError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell hideNav>
      <section className="relative flex min-h-[100dvh] w-full flex-col justify-end overflow-hidden bg-black">
        {/* Full Screen Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/entrada.jpg" 
            alt="MiReto21 Entrada" 
            className="h-full w-full object-cover opacity-90"
          />
          {/* Gradient to make the bottom text readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
        </div>

        <InstallApp />

        {/* Login Form at the Bottom */}
        <div className="relative z-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 p-6 pb-12">
          
          <div className="mb-6 text-center">
            {sent && (
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-white/20 backdrop-blur-md text-white">
                <CheckCircle2 className="h-7 w-7" />
              </div>
            )}
            <h1 className="font-display text-2xl font-bold tracking-tight text-white drop-shadow-md">
              {sent ? "Revisa tu correo" : "Comienza tu transformación"}
            </h1>
            <p className="mt-2 text-[14px] text-white/80 drop-shadow-md">
              {sent
                ? `Haz clic en el enlace que te enviamos, o ingresa el código de 6 dígitos aquí.`
                : "Ingresa tu correo para acceder a tu plan de 21 días."}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={submitEmail} className="w-full space-y-4">
              <div className="group flex items-center gap-3 rounded-2xl border border-white/20 bg-black/40 px-4 py-3.5 shadow-lg backdrop-blur-xl transition-all focus-within:border-white/50 focus-within:bg-black/60">
                <Mail className="h-5 w-5 text-white/60 group-focus-within:text-white transition-colors" />
                <input
                  type="email"
                  required
                  className="w-full bg-transparent text-[16px] font-medium text-white outline-none placeholder:font-normal placeholder:text-white/50"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white font-bold text-black shadow-xl transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />}
                Continuar
                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="w-full space-y-4">
              <div className="group flex items-center gap-3 rounded-2xl border border-white/20 bg-black/40 px-4 py-3.5 shadow-lg backdrop-blur-xl transition-all focus-within:border-white/50 focus-within:bg-black/60">
                <input
                  type="text"
                  required
                  className="w-full bg-transparent text-center text-2xl font-bold tracking-[0.5em] text-white outline-none placeholder:text-white/30"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoComplete="one-time-code"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white font-bold text-black shadow-xl transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />}
                Entrar
                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setOtp("");
                }}
                className="mt-4 w-full text-center text-sm font-semibold text-white/70 transition-colors hover:text-white"
              >
                Usar otro correo
              </button>
            </form>
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
