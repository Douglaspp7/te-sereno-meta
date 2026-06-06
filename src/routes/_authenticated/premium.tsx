import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Check, Lock, ChevronRight, Zap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/premium")({
  component: PremiumPage,
});

function PremiumPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-10 flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-[-10%] w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header com botão Voltar */}
      <div className="px-5 pt-8 pb-4 relative z-10 flex items-center">
        <button 
          onClick={() => navigate({ to: "/" })}
          className="h-10 w-10 bg-white/50 border border-border/50 rounded-full flex items-center justify-center text-foreground transition-all hover:bg-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 px-6 pt-4 flex flex-col relative z-10">
        
        {/* Ícone animado Premium */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="h-24 w-24 bg-gradient-to-tr from-amber-200 via-yellow-400 to-amber-500 rounded-[2rem] flex items-center justify-center shadow-[0_10px_30px_rgba(251,191,36,0.3)] rotate-[-10deg] animate-in fade-in zoom-in duration-700">
              <Sparkles className="h-12 w-12 text-yellow-950 rotate-[10deg]" />
            </div>
          </div>
        </div>

        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <h1 className="font-display text-4xl font-black text-foreground mb-3 leading-tight">
            Desbloquea MiReto21 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-500">Premium</span>
          </h1>
          <p className="text-muted-foreground text-[15px] max-w-[280px] mx-auto">
            Lleva tu transformación al siguiente nivel con herramientas de inteligencia artificial.
          </p>
        </div>

        {/* Features List */}
        <div className="space-y-4 mb-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="bg-white rounded-2xl p-4 border border-border/50 shadow-sm flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Análisis de Calorías con IA</h3>
              <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                Toma una foto de tu comida y la Inteligencia Artificial calculará las calorías y macronutrientes al instante.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-border/50 shadow-sm flex items-start gap-4 opacity-80">
            <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Herramientas Inteligentes</h3>
              <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                Próximamente: Chatbot nutricional, ajustes de rutina dinámicos y reportes personalizados.
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-secondary text-xs font-bold text-muted-foreground rounded-md">
                <Lock className="h-3 w-3" /> En desarrollo
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom CTA */}
        <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="bg-gradient-to-tr from-amber-100 to-yellow-50 rounded-[2rem] p-6 border border-amber-200 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Sparkles className="h-16 w-16 text-amber-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-2">Oferta Especial</p>
            <h4 className="font-display font-bold text-2xl text-amber-950 mb-6">Actualizar a Premium</h4>
            <button 
              className="w-full h-14 bg-gradient-to-r from-amber-400 to-yellow-500 text-yellow-950 rounded-[1.5rem] font-bold text-lg shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              Obtener Acceso <ChevronRight className="h-5 w-5" />
            </button>
            <p className="text-[10px] font-medium text-amber-800/60 mt-4 uppercase tracking-wider">
              Pago seguro mediante Hotmart
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
