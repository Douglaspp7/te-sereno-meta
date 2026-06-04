import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceder — Programa de 21 Días" },
      { name: "description", content: "Inicia sesión con tu correo para empezar tu transformación de 21 días." },
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
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/", replace: true });
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
      toast.success("¡Revisa tu correo!");
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
          {sent ? "Revisa tu correo" : "Accede con tu correo"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {sent
            ? `Te enviamos un enlace mágico a ${email}. Ábrelo desde este dispositivo para entrar.`
            : "Te enviaremos un enlace para entrar al instante. Sin contraseñas."}
        </p>
      </div>

      {sent ? (
        <div className="mt-8 space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="text-sm text-muted-foreground">
              Si no lo ves en unos minutos, revisa la carpeta de spam o correo no deseado.
            </div>
          </div>
          <button
            onClick={() => { setSent(false); setEmail(""); }}
            className="w-full text-center text-sm text-primary"
          >
            Usar otro correo
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-3">
          <Field icon={<Mail className="h-4 w-4 text-muted-foreground" />}>
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
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-medium text-primary-foreground shadow-soft transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Enviar enlace mágico
          </button>

          <p className="pt-2 text-center text-xs text-muted-foreground">
            Al continuar aceptas recibir un correo con tu enlace de acceso.
          </p>
        </form>
      )}
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
  if (msg.includes("rate limit") || msg.toLowerCase().includes("too many")) return "Demasiados intentos. Intenta en unos minutos.";
  if (msg.toLowerCase().includes("invalid email")) return "Correo inválido.";
  if (msg.toLowerCase().includes("signups not allowed")) return "Los registros están desactivados.";
  return msg;
}
