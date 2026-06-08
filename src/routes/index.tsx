import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowRight, Bot, Target, BrainCircuit, CalendarDays, Activity, Droplet, CheckCircle2, Mail, Lock } from "lucide-react";
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
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasLoggedInBefore, setHasLoggedInBefore] = useState(true);

  useEffect(() => {
    try {
      setHasLoggedInBefore(localStorage.getItem("mireto21:has-logged-in") === "1");
    } catch {}
  }, []);

  const isTestEmail = email.toLowerCase() === "douglasp7@hotmail.com";

  const submitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isTestEmail) {
        if (!password) {
          alert("Por favor, ingresa la contraseña para el correo de prueba.");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });
        if (error) throw error;
      } else {
        const emailClean = email.trim().toLowerCase();
        
        // 1. Verificar se o usuário tem permissão (comprou ou já é VIP)
        const { data: hasAccess, error: accessError } = await supabase.rpc('check_email_access', { check_email: emailClean });
        
        if (!hasAccess) {
          alert("Correo no registrado. Por favor, adquiere el desafío de 21 días en Hotmart primero.");
          setLoading(false);
          return;
        }

        // 2. Tentar Login
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: emailClean,
          password: password,
        });

        // 3. Se der erro de credenciais, significa que é o primeiro acesso (conta não existe)
        if (signInError && signInError.message.toLowerCase().includes('invalid login credentials')) {
          // Criar a conta
          const { error: signUpError } = await supabase.auth.signUp({
            email: emailClean,
            password: password,
          });
          
          if (signUpError) throw signUpError;
          // Após o signUp o usuário já é logado automaticamente (se confirm email estiver desligado)
        } else if (signInError) {
          throw signInError;
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Algo salió mal.";
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
            src="/images/entrada_optimized.webp" 
            alt="MiReto21 Entrada" 
            fetchPriority="high"
            className="h-full w-full object-cover opacity-90"
          />
          {/* Gradient to make the bottom text readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
        </div>

        <InstallApp />

        {/* Login Form at the Bottom */}
        <div className="relative z-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 p-6 pb-12">
          
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight text-white drop-shadow-md">
              Comienza tu transformación
            </h1>
            <p className="mt-2 text-[14px] text-white/80 drop-shadow-md">
              Ingresa el correo de tu compra para acceder.
            </p>
          </div>

          <div className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 backdrop-blur-xl">
            <p className="text-[13px] leading-snug text-white/90">
              <span className="font-bold text-emerald-300">¿Primera vez aquí?</span> Crea tu propia contraseña ahora — la usarás para entrar las próximas veces. Si ya tienes cuenta, ingresa la contraseña que creaste.
            </p>
          </div>

          <form onSubmit={submitAuth} className="w-full space-y-4">
            <div className="group flex items-center gap-3 rounded-2xl border border-white/20 bg-black/40 px-4 py-3.5 shadow-lg backdrop-blur-xl transition-all focus-within:border-white/50 focus-within:bg-black/60">
              <Mail className="h-5 w-5 text-white/60 group-focus-within:text-white transition-colors" />
              <input
                type="email"
                required
                className="w-full bg-transparent text-[16px] font-medium text-white outline-none placeholder:font-normal placeholder:text-white/50"
                placeholder="Correo usado en Hotmart"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="group flex flex-col gap-2">
              <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-black/40 px-4 py-3.5 shadow-lg backdrop-blur-xl transition-all focus-within:border-white/50 focus-within:bg-black/60">
                <Lock className="h-5 w-5 text-white/60 group-focus-within:text-white transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full bg-transparent text-[16px] font-medium text-white outline-none placeholder:font-normal placeholder:text-white/50"
                  placeholder="Crea o ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div className="flex justify-end px-2">
                <a 
                  href="https://wa.me/5513988331980?text=Hola,%20olvidé%20mi%20contraseña%20de%20MiReto21." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-white/60 hover:text-emerald-400 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white font-bold text-black shadow-xl transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />}
              Continuar
              {!loading && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}

function translateError(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes")) return "Por seguridad, intenta de nuevo en 1 minuto.";
  if (m.includes("invalid email")) return "Correo inválido.";
  if (m.includes("signups not allowed")) return "Los registros están desactivados.";
  if (m.includes("password should be at least")) return "La contraseña debe tener al menos 6 caracteres.";
  if (m.includes("already registered")) return "Este correo ya está registrado. Si olvidaste tu contraseña, contacta a soporte.";
  if (m.includes("email not confirmed")) return "Tu correo aún no está confirmado. Contacta a soporte para que te liberen el acceso.";
  return msg;
}
