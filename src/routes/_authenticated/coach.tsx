import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Sparkles, Cookie, Frown, Utensils, Dumbbell, ShoppingCart, TrendingUp, MessageCircleQuestion, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/_authenticated/coach")({
  component: CoachPage,
});

type ActionType = {
  id: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
  color: string;
  bgColor: string;
};

const actions: ActionType[] = [
  { id: "anxiety", icon: <Frown className="h-6 w-6" />, label: "Tengo ansiedad", desc: "No te rindas, te ayudo", color: "text-orange-500", bgColor: "bg-orange-500/10" },
  { id: "sugar", icon: <Cookie className="h-6 w-6" />, label: "Tengo ganas de azúcar", desc: "Alternativas saludables", color: "text-purple-500", bgColor: "bg-purple-500/10" },
  { id: "food", icon: <Utensils className="h-6 w-6" />, label: "Cambiar comida", desc: "Generar otra receta", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  { id: "workout", icon: <Dumbbell className="h-6 w-6" />, label: "Cambiar ejercicio", desc: "Buscar alternativas", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { id: "shop", icon: <ShoppingCart className="h-6 w-6" />, label: "Crear lista de compras", desc: "Para tu semana", color: "text-rose-500", bgColor: "bg-rose-500/10" },
  { id: "progress", icon: <TrendingUp className="h-6 w-6" />, label: "Ver mi progreso", desc: "Evolución y fotos", color: "text-amber-500", bgColor: "bg-amber-500/10" },
  { id: "ask", icon: <MessageCircleQuestion className="h-6 w-6" />, label: "Hacer una pregunta", desc: "Dudas sobre el plan", color: "text-primary", bgColor: "bg-primary/10" },
];

function CoachPage() {
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);

  const handleAction = (action: ActionType) => {
    setSelectedAction(action);
  };

  return (
    <AppShell>
      <div className="relative px-5 pt-8 pb-4">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
           <div className="w-32 h-32 bg-primary blur-3xl rounded-full" />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">AI Coach</h1>
          </div>
        </div>
        <p className="text-[15px] text-muted-foreground max-w-[280px]">
          Tu asistente personal. ¿En qué te puedo ayudar hoy?
        </p>
      </div>

      <div className="px-5 mt-4 space-y-3 pb-8">
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={() => handleAction(act)}
            className="flex w-full items-center gap-4 rounded-2xl border border-border/40 bg-white p-4 shadow-sm transition-all active:scale-[0.98]"
          >
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${act.bgColor} ${act.color}`}>
              {act.icon}
            </div>
            <div className="flex-1 text-left pt-0.5">
              <p className="font-bold text-[15px] text-foreground">{act.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{act.desc}</p>
            </div>
            <div className="shrink-0 opacity-40">
              <ArrowRight className="h-5 w-5" />
            </div>
          </button>
        ))}
      </div>

      <Sheet open={!!selectedAction} onOpenChange={(open) => !open && setSelectedAction(null)}>
        <SheetContent side="bottom" className="rounded-t-[2rem] px-6 pb-12 pt-8 sm:max-w-md mx-auto">
           {selectedAction && (
             <div className="flex flex-col items-center text-center">
                <div className={`grid h-16 w-16 place-items-center rounded-2xl mb-6 ${selectedAction.bgColor} ${selectedAction.color}`}>
                  {selectedAction.icon}
                </div>
                <SheetHeader>
                  <SheetTitle className="text-2xl font-display">{selectedAction.label}</SheetTitle>
                </SheetHeader>
                <p className="mt-4 text-muted-foreground">
                  {selectedAction.id === "anxiety" && "Respira profundo. Es normal sentir ansiedad. Recuerda por qué empezaste y lo lejos que has llegado. ¡Tú puedes controlar esto!"}
                  {selectedAction.id === "sugar" && "¡Cuidado con los picos de insulina! Si tienes mucha necesidad, te sugiero comer media manzana o unas almendras. Beber agua también ayuda a calmar el antojo."}
                  {(selectedAction.id !== "anxiety" && selectedAction.id !== "sugar") && "La Inteligencia Artificial está procesando tu solicitud para generar una respuesta personalizada. (Mockup)"}
                </p>
                <button 
                  onClick={() => setSelectedAction(null)}
                  className="mt-8 w-full rounded-full bg-foreground py-4 font-bold text-background active:scale-[0.98] transition-transform"
                >
                  Entendido, gracias
                </button>
             </div>
           )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
