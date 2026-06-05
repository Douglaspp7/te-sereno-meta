import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { getDayContent, type RecipeDef } from "@/lib/content/days";
import { Flame, Target, ChevronDown, ChevronUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/plan")({
  component: PlanPage,
});

function PlanPage() {
  const day = getDayContent(1); // In a real app, read current day from user progress

  return (
    <AppShell>
      <PageHeader title="Mi Plan" subtitle={`Día ${day.dayNumber} de 21`} />
      
      <div className="px-5 pb-10 space-y-6">
        {/* Mission & Motivation */}
        <section className="rounded-[1.5rem] bg-accent/10 p-5 border border-accent/20">
          <div className="flex items-center gap-2 text-accent mb-2">
            <Target className="h-5 w-5" />
            <h2 className="font-display text-lg">Misión del día</h2>
          </div>
          <p className="text-[16px] font-medium text-foreground">{day.mission}</p>
          <div className="mt-4 rounded-xl bg-white/60 p-3 text-sm text-muted-foreground italic">
            "{day.motivation}"
          </div>
        </section>

        {/* Meals */}
        <section>
          <h2 className="mb-4 font-display text-2xl text-foreground">Comidas de hoy</h2>
          <div className="space-y-4">
            <RecipeCard recipe={day.breakfast} />
            <RecipeCard recipe={day.lunch} />
            <RecipeCard recipe={day.dinner} />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function RecipeCard({ recipe }: { recipe: RecipeDef }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-border/50 bg-white shadow-sm">
      <div className="relative h-40 w-full">
        <img src={recipe.image} alt={recipe.name} className="h-full w-full object-cover" />
        <div className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-foreground backdrop-blur-sm">
          {recipe.label}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg text-foreground leading-tight">{recipe.name}</h3>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-bold text-orange-600">
            <Flame className="h-3 w-3" />
            {recipe.kcal} kcal
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 py-3 text-sm font-bold text-primary transition active:scale-[0.98]"
        >
          {expanded ? "Ocultar receta" : "Ver receta"}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {expanded && (
          <div className="mt-4 space-y-4 border-t border-border/50 pt-4">
            <div>
              <h4 className="font-bold text-sm text-foreground mb-2">Ingredientes</h4>
              <ul className="space-y-1">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground mb-2">Preparación</h4>
              <ol className="space-y-2">
                {recipe.instructions.map((inst, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="font-bold text-primary/70">{i + 1}.</span>
                    {inst}
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex gap-4 pt-2 border-t border-border/30">
               <div className="text-xs"><span className="font-bold text-foreground">P:</span> {recipe.macros.p}g</div>
               <div className="text-xs"><span className="font-bold text-foreground">C:</span> {recipe.macros.c}g</div>
               <div className="text-xs"><span className="font-bold text-foreground">G:</span> {recipe.macros.f}g</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
