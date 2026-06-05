import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Mail, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Acceder — MiReto21 AI" },
      { name: "description", content: "Inicia sesión en MiReto21 AI con tu correo." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/", replace: true });
    });
  }, [navigate]);

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
      toast.error(translateError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background px-5 pb-10 pt-12">
      <div className="flex flex-col items-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-soft">
          {sent ? <CheckCircle2 className="h-7 w-7" /> : <Sparkles className="h-7 w-7" />}
        </div>
        <h1 className="mt-5 font-display text-3xl text-foreground">
          {sent ? "Revisa tu correo" : "Entra con tu correo"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {sent
            ? `Te enviamos un enlace a ${email}. Ábrelo desde este dispositivo para entrar.`
            : "Sin contraseñas. Recibirás un enlace mágico para acceder."}
        </p>
      </div>

      {!sent ? (
        <form onSubmit={submit} className="mt-8 space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              required
              className="w-full bg-transparent text-sm outline-none"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-medium text-primary-foreground shadow-soft transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Enviar enlace mágico
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      ) : (
        <button
          onClick={() => {
            setSent(false);
            setEmail("");
          }}
          className="mt-8 text-sm text-primary"
        >
          Usar otro correo
        </button>
      )}

      <div className="mt-auto pt-8 text-center">
        <Link to="/" className="text-xs text-muted-foreground">← Volver al inicio</Link>
      </div>
    </div>
  );
}

function translateError(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("rate limit") || m.includes("too many")) return "Demasiados intentos. Intenta en unos minutos.";
  if (m.includes("invalid email")) return "Correo inválido.";
  if (m.includes("signups not allowed")) return "Los registros están desactivados.";
  return msg;
}
