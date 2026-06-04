import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf, Mail, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceder — Programa de 21 Días" },
      { name: "description", content: "Inicia sesión o crea tu cuenta para empezar tu transformación de 21 días." },
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
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name || email.split("@")[0] },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("¡Cuenta creada! Bienvenido al programa.");
        navigate({ to: "/", replace: true });
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenido de nuevo 🌿");
        navigate({ to: "/", replace: true });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        toast.success("Revisa tu correo para restablecer tu contraseña.");
        setMode("signin");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Algo salió mal.";
      toast.error(translateError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background px-5 pb-10 pt-12">
      <Link to="/" className="self-start text-xs text-muted-foreground">← Volver</Link>
      <div className="mt-8 flex flex-col items-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl gradient-sage text-sage-deep shadow-soft">
          <Leaf className="h-8 w-8" />
        </div>
        <h1 className="mt-5 font-display text-3xl text-foreground">
          {mode === "signup" ? "Crea tu cuenta" : mode === "forgot" ? "Recupera tu acceso" : "Bienvenido de nuevo"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signup"
            ? "Empieza hoy tu programa de 21 días."
            : mode === "forgot"
              ? "Te enviaremos un enlace a tu correo."
              : "Continúa tu camino hacia el bienestar."}
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-3">
        {mode === "signup" && (
          <Field>
            <input
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
              placeholder="Contraseña (mínimo 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </Field>
        )}

        {mode === "signin" && (
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              Recordarme
            </label>
            <button type="button" onClick={() => setMode("forgot")} className="text-primary">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-medium text-primary-foreground shadow-soft transition active:scale-[0.98] disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signup" ? "Crear cuenta" : mode === "forgot" ? "Enviar enlace" : "Iniciar sesión"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "signin" && (
          <>
            ¿No tienes cuenta?{" "}
            <button onClick={() => setMode("signup")} className="font-medium text-primary">
              Regístrate
            </button>
          </>
        )}
        {mode === "signup" && (
          <>
            ¿Ya tienes cuenta?{" "}
            <button onClick={() => setMode("signin")} className="font-medium text-primary">
              Inicia sesión
            </button>
          </>
        )}
        {mode === "forgot" && (
          <button onClick={() => setMode("signin")} className="font-medium text-primary">
            Volver a iniciar sesión
          </button>
        )}
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
  if (msg.includes("Invalid login")) return "Correo o contraseña incorrectos.";
  if (msg.includes("already registered")) return "Este correo ya está registrado.";
  if (msg.includes("rate limit")) return "Demasiados intentos. Intenta más tarde.";
  if (msg.toLowerCase().includes("pwned")) return "Esta contraseña ha sido filtrada. Elige otra más segura.";
  return msg;
}
