import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/activate")({
  component: ActivatePage,
});

function ActivatePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("No autenticado");

      // Validar email (só para UI feedback)
      if (!email.includes("@")) {
        throw new Error("Por favor, ingresa un correo electrónico válido.");
      }

      // Mock da validação: atualizamos manualmente a tabela no banco
      // Futuramente isso será substituído pela integração com o HotmartService
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ subscription_status: 'active' })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/"; // Força o recarregamento pra rodar o middleware denovo
      }, 2000);

    } catch (err: any) {
      setErrorMsg(err.message || "Error validando el acceso. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="h-20 w-20 bg-emerald-100 rounded-[2rem] flex items-center justify-center shadow-lg shadow-emerald-500/20 rotate-[-10deg] transition-transform">
              <ShieldCheck className="h-10 w-10 text-emerald-600 rotate-[10deg]" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-md">
              <Lock className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-black text-foreground mb-2">Activa tu acceso a MiReto21</h1>
          <p className="text-muted-foreground text-sm">
            Ingresa el correo electrónico con el que realizaste la compra para validar tu suscripción.
          </p>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <h3 className="font-bold text-emerald-800 text-lg mb-1">¡Acceso validado!</h3>
            <p className="text-emerald-600/80 text-sm">Redirigiendo a tu plan...</p>
          </div>
        ) : (
          <form onSubmit={handleActivate} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="h-5 w-5" />
              </div>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-14 pl-12 pr-4 bg-white border border-border rounded-[1.5rem] text-[15px] font-medium shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="tu@correo.com"
              />
            </div>

            {errorMsg && (
              <p className="text-destructive text-xs font-bold px-2">{errorMsg}</p>
            )}

            <button 
              type="submit"
              disabled={loading || !email}
              className="w-full h-14 bg-foreground text-background rounded-[1.5rem] font-bold shadow-lg shadow-foreground/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? "Validando..." : (
                <>Validar acceso <ArrowRight className="h-5 w-5" /></>
              )}
            </button>
          </form>
        )}
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-muted-foreground font-medium">
          Integración segura con la plataforma
        </p>
      </div>
    </div>
  );
}
