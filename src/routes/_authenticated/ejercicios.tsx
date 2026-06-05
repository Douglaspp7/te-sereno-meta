import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { PlayCircle, Clock, Flame } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ejercicios")({
  component: EjerciciosPage,
});

function EjerciciosPage() {
  return (
    <AppShell>
      <PageHeader title="Ejercicios" subtitle="Tu rutina de hoy." />
      <div className="px-5 mt-2 space-y-6">
        <div className="rounded-[2rem] border border-border/40 bg-white p-5 shadow-sm overflow-hidden relative">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <div className="aspect-video w-full rounded-2xl bg-black/5 flex items-center justify-center relative overflow-hidden mb-4 border border-border/50">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070')] bg-cover bg-center opacity-80" />
             <div className="absolute inset-0 bg-black/40" />
             <button className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center relative z-10 hover:scale-105 active:scale-95 transition-transform shadow-xl shadow-primary/30">
                <PlayCircle className="h-8 w-8" />
             </button>
          </div>
          <h3 className="font-bold text-lg text-foreground">Entrenamiento Full Body</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Nivel principiante. Sin equipamiento.</p>
          <div className="flex gap-4">
             <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-background rounded-full px-3 py-1.5 border border-border/50">
                <Clock className="h-3.5 w-3.5" /> 20 min
             </div>
             <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-background rounded-full px-3 py-1.5 border border-border/50">
                <Flame className="h-3.5 w-3.5 text-orange-500" /> ~150 kcal
             </div>
          </div>
          
          <button className="w-full mt-6 rounded-[1.5rem] bg-foreground py-4 text-sm font-bold text-background active:scale-[0.98] transition-transform flex justify-center items-center gap-2">
            Marcar como completado
          </button>
        </div>
      </div>
    </AppShell>
  );
}
