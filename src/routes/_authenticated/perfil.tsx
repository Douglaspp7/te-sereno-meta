import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, User, Mail, ShieldCheck, Crown, AlertTriangle, RotateCcw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showQuizConfirm, setShowQuizConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Obter usuário logado
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      if (error) throw error;
      return data;
    },
  });

  const resetProgress = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("No user");

      // 1. Apagar progresso diário
      const { error: deleteError } = await supabase
        .from("daily_progress")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      // 2. Atualizar data de início
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ plan_started_at: new Date().toISOString() })
        .eq("id", user.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      navigate({ to: "/" });
    }
  });

  const redoQuiz = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("No user");
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ onboarding_completed: false })
        .eq("id", user.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      navigate({ to: "/onboarding" });
    }
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate({ to: "/" });
  };

  if (!profile) return null;

  const isPremium = profile.subscription_plan === 'premium';
  const isActive = profile.subscription_status === 'active';

  return (
    <div className="min-h-screen bg-secondary/30 pb-10">
      {/* Header */}
      <div className="bg-background px-5 pt-8 pb-4 flex items-center sticky top-0 z-20 shadow-sm border-b border-border">
        <button 
          onClick={() => navigate({ to: "/" })}
          className="h-10 w-10 bg-secondary border border-border/50 rounded-full flex items-center justify-center text-foreground transition-all hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center font-display text-xl font-bold text-foreground mr-10">Mi Perfil</h1>
      </div>

      <div className="px-5 py-6 space-y-6">
        
        {/* Info Básica */}
        <div className="bg-background rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 text-primary grid place-items-center">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-lg">{profile.display_name || "Usuario"}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5" /> {profile.email || user?.email}
            </p>
          </div>
        </div>

        {/* Assinatura */}
        <div>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">Mi suscripción</h3>
          <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Estado</p>
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-destructive'}`} />
                  <span className="font-bold text-foreground">{isActive ? 'Activo' : 'Inactivo'}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Plan Actual</p>
                <div className="flex items-center gap-1.5 justify-end">
                  {isPremium ? <Crown className="h-4 w-4 text-amber-500" /> : <ShieldCheck className="h-4 w-4 text-slate-500" />}
                  <span className={`font-bold ${isPremium ? 'text-amber-600' : 'text-slate-600'}`}>
                    {isPremium ? 'Premium' : 'Básico'}
                  </span>
                </div>
              </div>
            </div>
            {/* Upsell escondido por enquanto, já que a IA ainda não foi implementada */}
            {/* !isPremium && (
              <div className="p-5 bg-gradient-to-r from-amber-50 to-yellow-50">
                <p className="text-sm text-amber-900 font-medium mb-4">
                  Desbloquea herramientas de inteligencia artificial y maximiza tus resultados.
                </p>
                <button 
                  onClick={() => navigate({ to: "/premium" })}
                  className="w-full h-12 bg-amber-400 text-yellow-950 font-bold rounded-xl shadow-sm hover:bg-amber-500 transition-colors"
                >
                  Actualizar a Premium
                </button>
              </div>
            ) */}
          </div>
        </div>

        {/* Zona de Perigo */}
        <div className="pt-4">
          <h3 className="text-sm font-bold text-destructive uppercase tracking-wider mb-3 px-1 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" /> Zona de Peligro
          </h3>
          <div className="bg-background rounded-2xl border border-border shadow-sm p-5">
            <h4 className="font-bold text-foreground mb-1">Reiniciar Reto</h4>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Comenzarás el día 1 nuevamente. Tus recompensas y peso registrado se mantendrán intactos.
            </p>
            
            {!showResetConfirm ? (
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="w-full h-12 border-2 border-destructive/20 text-destructive font-bold rounded-xl hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Comenzar nuevamente
              </button>
            ) : (
              <div className="bg-destructive/10 rounded-xl p-4 border border-destructive/20 animate-in fade-in zoom-in-95 duration-200">
                <p className="text-sm font-bold text-destructive mb-4 text-center">¿Estás seguro de reiniciar todo tu progreso diario?</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 h-10 bg-white border border-border rounded-lg text-sm font-bold text-foreground"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => resetProgress.mutate()}
                    disabled={resetProgress.isPending}
                    className="flex-1 h-10 bg-destructive text-white rounded-lg text-sm font-bold disabled:opacity-50"
                  >
                    {resetProgress.isPending ? "Reiniciando..." : "Sí, reiniciar"}
                  </button>
                </div>
              </div>
            )}

            <div className="h-px bg-border my-6" />

            <h4 className="font-bold text-foreground mb-1">Rehacer Cuestionario</h4>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Vuelve a realizar el cuestionario inicial para actualizar tus metas, peso objetivo y condición física.
            </p>

            {!showQuizConfirm ? (
              <button 
                onClick={() => setShowQuizConfirm(true)}
                className="w-full h-12 border border-border text-foreground font-bold rounded-xl hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                Volver a evaluar
              </button>
            ) : (
              <div className="bg-muted rounded-xl p-4 border border-border/50 animate-in fade-in zoom-in-95 duration-200">
                <p className="text-sm font-bold text-foreground mb-4 text-center">¿Deseas rehacer el cuestionario ahora?</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowQuizConfirm(false)}
                    className="flex-1 h-10 bg-background border border-border rounded-lg text-sm font-bold text-foreground"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => redoQuiz.mutate()}
                    disabled={redoQuiz.isPending}
                    className="flex-1 h-10 bg-primary text-primary-foreground rounded-lg text-sm font-bold disabled:opacity-50"
                  >
                    {redoQuiz.isPending ? "Cargando..." : "Sí, rehacer"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cerrar Sesión */}
        <div className="pt-4">
          <div className="bg-background rounded-2xl border border-border shadow-sm p-5">
            <h4 className="font-bold text-foreground mb-1">Cerrar Sesión</h4>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Saldrás de tu cuenta en este dispositivo. Necesitarás un nuevo enlace mágico para volver a entrar.
            </p>

            {!showLogoutConfirm ? (
              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full h-12 border border-destructive/50 text-destructive font-bold rounded-xl hover:bg-destructive/5 transition-colors flex items-center justify-center"
              >
                Cerrar sesión
              </button>
            ) : (
              <div className="bg-destructive/10 rounded-xl p-4 border border-destructive/20 animate-in fade-in zoom-in-95 duration-200">
                <p className="text-sm font-bold text-destructive mb-4 text-center">¿Estás seguro de que quieres salir?</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 h-10 bg-white border border-border rounded-lg text-sm font-bold text-foreground"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex-1 h-10 bg-destructive text-white rounded-lg text-sm font-bold"
                  >
                    Sí, salir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
