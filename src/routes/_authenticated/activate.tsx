import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Lock, ShieldCheck, CheckCircle2, ExternalLink, LogOut, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/lib/auth";
import { checkHotmartPurchase } from "@/lib/hotmart.functions";

export const Route = createFileRoute("/_authenticated/activate")({
  component: ActivatePage,
});

const HOTMART_SALES_URL = "https://pay.hotmart.com/"; // TODO: trocar pela URL real do produto

function ActivatePage() {
  const { user } = useUser();
  const checkFn = useServerFn(checkHotmartPurchase);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCheck = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await checkFn({});
      if (res.activated) {
        setSuccess(true);
        setTimeout(() => { window.location.href = "/"; }, 1500);
      } else {
        setErrorMsg("Aún no encontramos tu compra. Asegúrate de haber comprado con este mismo correo y espera 1–2 minutos.");
      }
    } catch (e: any) {
      setErrorMsg(e?.message || "Error al verificar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="h-20 w-20 bg-emerald-100 rounded-[2rem] flex items-center justify-center shadow-lg shadow-emerald-500/20 rotate-[-10deg]">
              <ShieldCheck className="h-10 w-10 text-emerald-600 rotate-[10deg]" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-md">
              <Lock className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-black text-foreground mb-2">Activa tu acceso</h1>
          <p className="text-muted-foreground text-sm">
            Tu cuenta <span className="font-semibold text-foreground">{user?.email}</span> aún no tiene una suscripción activa.
          </p>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <h3 className="font-bold text-emerald-800 text-lg mb-1">¡Acceso activado!</h3>
            <p className="text-emerald-600/80 text-sm">Redirigiendo a tu plan...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <a
              href={HOTMART_SALES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-14 bg-foreground text-background rounded-[1.5rem] font-bold shadow-lg shadow-foreground/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              Comprar acceso <ExternalLink className="h-5 w-5" />
            </a>

            <button
              onClick={handleCheck}
              disabled={loading}
              className="w-full h-14 bg-white border border-border rounded-[1.5rem] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
              Ya compré, verificar
            </button>

            {errorMsg && (
              <p className="text-destructive text-xs font-bold px-2 text-center">{errorMsg}</p>
            )}

            <button
              onClick={handleLogout}
              className="w-full text-muted-foreground text-xs font-semibold flex items-center justify-center gap-1 mt-4"
            >
              <LogOut className="h-3 w-3" /> Usar otra cuenta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
