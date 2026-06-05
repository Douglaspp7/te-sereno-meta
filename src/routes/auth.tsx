import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Acceder — MiReto21 AI" },
      { name: "description", content: "Inicia sesión o crea tu cuenta en MiReto21 AI." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/", replace: true });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("¡Cuenta creada!");
        const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
        if (!e2) navigate({ to: "/", replace: true });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Te enviamos un correo para recuperar tu contraseña.");
        setMode("signin");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Algo salió mal.";
      toast.error(translateError(msg));
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === "signin" ? "Bienvenido de vuelta" : mode === "signup" ? "Crea tu cuenta" : "Recuperar contraseña";
  const subtitle =
    mode === "signin"
      ? "Continúa tu reto de 21 días."
      : mode === "signup"
      ? "Tu plan personalizado con IA te espera."
      : "Te enviaremos un enlace a tu correo.";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background px-5 pb-10 pt-12">
      <div className="flex flex-col items-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-soft">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-3xl text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-3">
        {mode === "signup" && (
          <Field>
            <input
              type="text"
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </Field>
        )}
        <Field icon={<Mail className="h-4 w-4 text-muted-foreground" />}>
          <input
            type="email"
            required
            className="w-full bg-transparent text-sm outline-none"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </Field>
        {mode !== "forgot" && (
          <Field icon={<Lock className="h-4 w-4 text-muted-foreground" />}>
            <input
              type="password"
              required
              minLength={6}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </Field>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-medium text-primary-foreground shadow-soft transition active:scale-[0.98] disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signin" ? "Entrar" : mode === "signup" ? "Crear cuenta" : "Enviar correo"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm">
        {mode === "signin" && (
          <>
            <button onClick={() => setMode("signup")} className="text-primary">
              ¿No tienes cuenta? <span className="font-medium">Crear una</span>
            </button>
            <div>
              <button onClick={() => setMode("forgot")} className="text-xs text-muted-foreground">
                Olvidé mi contraseña
              </button>
            </div>
          </>
        )}
        {mode === "signup" && (
          <button onClick={() => setMode("signin")} className="text-primary">
            ¿Ya tienes cuenta? <span className="font-medium">Entrar</span>
          </button>
        )}
        {mode === "forgot" && (
          <button onClick={() => setMode("signin")} className="text-primary">
            Volver a iniciar sesión
          </button>
        )}
      </div>

      <div className="mt-auto pt-8 text-center">
        <Link to="/" className="text-xs text-muted-foreground">← Volver al inicio</Link>
      </div>
    </div>
  );
}

function Field({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
      {icon}
      {children}
    </div>
  );
}

function translateError(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("user already registered")) return "Ya existe una cuenta con ese correo.";
  if (m.includes("rate limit") || m.includes("too many")) return "Demasiados intentos. Intenta en unos minutos.";
  if (m.includes("invalid email")) return "Correo inválido.";
  if (m.includes("password")) return "La contraseña debe tener al menos 6 caracteres.";
  if (m.includes("signups not allowed")) return "Los registros están desactivados.";
  return msg;
}
