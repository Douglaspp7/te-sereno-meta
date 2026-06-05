import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Flame, Check, Clock, ChefHat } from "lucide-react";

export type RecipeData = {
  id: string;
  label: string;
  name: string;
  kcal: number;
  macros: { p: number; c: number; f: number };
  ingredients: string[];
  instructions: string[];
};

export function RecipeModal({
  recipe,
  open,
  onOpenChange,
  done,
  onToggle,
}: {
  recipe: RecipeData | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  done: boolean;
  onToggle: () => void;
}) {
  if (!recipe) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-[2rem] px-0 pb-0 flex flex-col gap-0 overflow-hidden bg-[#F8FAF8]">
        {/* Fake Image Area */}
        <div className="relative h-48 w-full bg-secondary/20 flex flex-col items-center justify-center">
           <ChefHat className="h-16 w-16 text-primary/30 mb-2" />
           <p className="text-xs font-bold uppercase tracking-widest text-primary/40">Receta IA</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1">{recipe.label}</p>
          <SheetTitle className="text-2xl font-extrabold font-display leading-tight">{recipe.name}</SheetTitle>
          
          <div className="mt-4 flex gap-3 text-sm">
            <div className="flex items-center gap-1.5 rounded-full bg-white border border-border/50 px-3 py-1.5 font-bold shadow-sm">
              <Flame className="h-4 w-4 text-orange-500" /> {recipe.kcal} kcal
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white border border-border/50 px-3 py-1.5 font-bold shadow-sm">
              <Clock className="h-4 w-4 text-blue-500" /> 15 min
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white border border-border/50 p-3 text-center shadow-sm">
               <p className="text-lg font-extrabold text-blue-500">{recipe.macros.p}g</p>
               <p className="text-[10px] font-bold uppercase text-muted-foreground">Proteínas</p>
            </div>
            <div className="rounded-xl bg-white border border-border/50 p-3 text-center shadow-sm">
               <p className="text-lg font-extrabold text-amber-500">{recipe.macros.c}g</p>
               <p className="text-[10px] font-bold uppercase text-muted-foreground">Carbos</p>
            </div>
            <div className="rounded-xl bg-white border border-border/50 p-3 text-center shadow-sm">
               <p className="text-lg font-extrabold text-rose-500">{recipe.macros.f}g</p>
               <p className="text-[10px] font-bold uppercase text-muted-foreground">Grasas</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><span className="w-1.5 h-4 bg-primary rounded-full"></span>Ingredientes</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                  <span className="text-muted-foreground font-medium">{ing}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><span className="w-1.5 h-4 bg-primary rounded-full"></span>Preparación</h3>
            <div className="space-y-4">
              {recipe.instructions.map((inst, i) => (
                <div key={i} className="flex gap-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">{inst}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Button */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border/50 bg-white/80 backdrop-blur-md p-4 pb-8">
          <button
            onClick={() => {
              onToggle();
              onOpenChange(false);
            }}
            className={`w-full rounded-[1.5rem] py-4 font-bold text-lg shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
              done 
                ? "bg-secondary text-primary border border-primary/20" 
                : "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
            }`}
          >
            {done ? "Desmarcar comida" : <><Check className="h-5 w-5" strokeWidth={3} /> Registrar Comida</>}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
