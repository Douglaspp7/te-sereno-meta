import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { getDayContent, type RecipeDef } from "@/lib/content/days";
import { 
  Flame, Target, ChevronDown, ChevronUp, ChevronLeft, 
  CheckCircle2, Circle, Clock, Heart, ArrowLeft, Trophy, PartyPopper
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/_authenticated/plan")({
  component: PlanPage,
});

// A simple Dialog component for the Recipe Detail to avoid external dependencies
function FullScreenRecipeModal({ 
  recipe, 
  onClose,
  isPrepared,
  onMarkPrepared
}: { 
  recipe: RecipeDef | null, 
  onClose: () => void,
  isPrepared: boolean,
  onMarkPrepared: () => void
}) {
  if (!recipe) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="relative h-72 w-full">
        <img src={recipe.image} alt={recipe.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <button 
          onClick={onClose}
          className="absolute top-safe mt-4 left-4 h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      <div className="px-5 py-6 space-y-8 bg-background relative -mt-6 rounded-t-[2rem]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">{recipe.label}</span>
          </div>
          <h2 className="font-display text-3xl text-foreground leading-tight">{recipe.name}</h2>
          
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground bg-accent/10 text-accent px-3 py-1.5 rounded-full">
              <Clock className="h-4 w-4" /> {recipe.prepTimeMin} min
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full">
              <Flame className="h-4 w-4" /> {recipe.kcal} kcal
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 rounded-2xl bg-muted p-4 text-center">
            <div className="text-xl font-bold text-foreground">{recipe.macros.p}g</div>
            <div className="text-xs font-medium text-muted-foreground mt-1">Proteína</div>
          </div>
          <div className="flex-1 rounded-2xl bg-muted p-4 text-center">
            <div className="text-xl font-bold text-foreground">{recipe.macros.c}g</div>
            <div className="text-xs font-medium text-muted-foreground mt-1">Carbs</div>
          </div>
          <div className="flex-1 rounded-2xl bg-muted p-4 text-center">
            <div className="text-xl font-bold text-foreground">{recipe.macros.f}g</div>
            <div className="text-xs font-medium text-muted-foreground mt-1">Grasa</div>
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl mb-4">Ingredientes</h3>
          <ul className="space-y-3">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary/40" />
                <span className="text-[16px] text-foreground font-medium">{ing}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xl mb-4">Modo de preparo</h3>
          <ol className="space-y-4">
            {recipe.instructions.map((inst, i) => (
              <li key={i} className="flex gap-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary mt-0.5">
                  {i + 1}
                </div>
                <p className="text-[16px] text-foreground leading-relaxed">{inst}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="pt-4 pb-12 space-y-3">
          <button 
            className="w-full flex items-center justify-center gap-2 py-4 rounded-[1.5rem] bg-accent/10 text-accent font-bold text-lg active:scale-[0.98] transition-transform"
          >
            <Heart className="h-5 w-5" /> Guardar favorita
          </button>
          
          <button 
            onClick={() => {
              onMarkPrepared();
              onClose();
            }}
            disabled={isPrepared}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-bold text-lg active:scale-[0.98] transition-transform ${
              isPrepared 
                ? "bg-muted text-muted-foreground" 
                : "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
            }`}
          >
            {isPrepared ? (
              <><CheckCircle2 className="h-5 w-5" /> Ya preparada</>
            ) : (
              <><CheckCircle2 className="h-5 w-5" /> Marcar como preparada</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


function PlanPage() {
  const [selectedDayNum, setSelectedDayNum] = useState(1);
  const day = getDayContent(selectedDayNum);
  const currentLogDate = new Date().toISOString().split("T")[0];
  
  const qc = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDef | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      return data;
    },
    enabled: !!userId,
  });

  const { data: progress } = useQuery({
    queryKey: ["daily_progress", userId, currentLogDate],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from("daily_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("log_date", currentLogDate)
        .maybeSingle();
      return data || {
        mission_done: false,
        breakfast_done: false,
        lunch_done: false,
        dinner_done: false,
        water_glasses: 0,
        exercise_done: false
      };
    },
    enabled: !!userId,
  });

  const updateProgress = useMutation({
    mutationFn: async (updates: Partial<typeof progress>) => {
      if (!userId) return;
      const { error } = await supabase.from("daily_progress").upsert({
        user_id: userId,
        log_date: currentLogDate,
        day_number: selectedDayNum,
        ...progress,
        ...updates,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["daily_progress", userId, currentLogDate] });
    }
  });

  const handleCompleteMission = () => {
    if (progress?.mission_done) return;
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#A7E154', '#55C4A6', '#FFFFFF'] });
    updateProgress.mutate({ mission_done: true });
  };

  const handleMarkMeal = (type: 'breakfast' | 'lunch' | 'dinner') => {
    if (type === 'breakfast') updateProgress.mutate({ breakfast_done: true });
    if (type === 'lunch') updateProgress.mutate({ lunch_done: true });
    if (type === 'dinner') updateProgress.mutate({ dinner_done: true });
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.8 }, colors: ['#FF9800', '#FFC107'] });
  };

  // Calculate Checklist progress
  const tasks = [
    { name: "Desayuno", done: progress?.breakfast_done },
    { name: "Almuerzo", done: progress?.lunch_done },
    { name: "Cena", done: progress?.dinner_done },
    { name: "Misión", done: progress?.mission_done },
    { name: "Agua (Meta 8)", done: (progress?.water_glasses || 0) >= 8 },
    { name: "Ejercicio", done: progress?.exercise_done },
  ];
  const completedTasks = tasks.filter(t => t.done).length;
  const totalTasks = tasks.length;
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  return (
    <AppShell>
      {/* Header and Stats */}
      <div className="px-5 pt-4 pb-6 bg-gradient-to-b from-primary/10 to-transparent">
        <h1 className="font-display text-3xl text-foreground">Mi Plan</h1>
        <div className="text-muted-foreground font-medium mb-6">Día {day.dayNumber} de 21</div>
        
        {/* Visual Progress Bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-3 flex-1 bg-black/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="font-bold text-sm text-foreground">{progressPercent}%</span>
        </div>

        {/* Weights */}
        <div className="flex justify-between items-center bg-white rounded-2xl p-4 shadow-sm border border-border/50">
          <div className="text-center">
            <div className="text-xs text-muted-foreground font-medium mb-1">Inicial</div>
            <div className="font-bold text-foreground">{profile?.start_weight || '--'} kg</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-xs text-primary font-bold mb-1">Actual</div>
            <div className="font-bold text-foreground text-lg">{profile?.current_weight || profile?.start_weight || '--'} kg</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-xs text-muted-foreground font-medium mb-1">Meta</div>
            <div className="font-bold text-foreground">{profile?.goal_weight || '--'} kg</div>
          </div>
        </div>
      </div>

      {/* Horizontal Calendar */}
      <div className="px-5 mb-8">
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x no-scrollbar">
          {Array.from({ length: 21 }).map((_, i) => {
            const d = i + 1;
            const isToday = d === selectedDayNum;
            // Mocking past days as completed (green) for visual effect. 
            // In a real app, we'd query the completion status of past days.
            const isPast = d < selectedDayNum; 
            
            return (
              <button
                key={d}
                onClick={() => setSelectedDayNum(d)}
                className={`snap-center shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-[1.2rem] border transition-all ${
                  isToday ? "bg-foreground text-background border-foreground shadow-lg scale-105" : 
                  isPast ? "bg-primary/20 text-primary border-primary/20" : 
                  "bg-white text-muted-foreground border-border"
                }`}
              >
                <span className="text-[10px] font-bold uppercase mb-1 opacity-80">Día</span>
                <span className="text-xl font-display">{d}</span>
                {isPast && <CheckCircle2 className="h-3 w-3 mt-1 text-primary" />}
              </button>
            )
          })}
        </div>
      </div>
      
      <div className="px-5 pb-24 space-y-8">
        {/* Mission */}
        <section className="rounded-[2rem] bg-accent p-6 text-white shadow-xl shadow-accent/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Target className="h-24 w-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Misión de hoy
              </div>
            </div>
            <h2 className="font-display text-2xl mb-2">{day.mission}</h2>
            <p className="text-white/80 text-sm font-medium mb-6">Cada pequeña elección te acerca un paso más a tu meta.</p>
            
            <button 
              onClick={handleCompleteMission}
              disabled={progress?.mission_done}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-[16px] transition-all ${
                progress?.mission_done 
                  ? "bg-white/20 text-white cursor-default" 
                  : "bg-white text-accent hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              }`}
            >
              {progress?.mission_done ? (
                <><CheckCircle2 className="h-5 w-5" /> Misión completada</>
              ) : (
                "Completar misión"
              )}
            </button>
          </div>
        </section>

        {/* Motivation */}
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <div className="text-xs font-bold uppercase text-primary mb-1">Consejo del día</div>
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {day.motivation}
              </p>
            </div>
          </div>
        </section>

        {/* Meals */}
        <section>
          <div className="flex items-center justify-between mb-5">
             <h2 className="font-display text-2xl text-foreground">Tus comidas</h2>
             <span className="text-xs font-bold text-muted-foreground bg-black/5 px-3 py-1 rounded-full">Día {day.dayNumber}</span>
          </div>
          
          <div className="space-y-6">
            <MealCard 
              recipe={day.breakfast} 
              isDone={!!progress?.breakfast_done}
              onOpen={() => setSelectedRecipe(day.breakfast)} 
            />
            <MealCard 
              recipe={day.lunch} 
              isDone={!!progress?.lunch_done}
              onOpen={() => setSelectedRecipe(day.lunch)} 
            />
            <MealCard 
              recipe={day.dinner} 
              isDone={!!progress?.dinner_done}
              onOpen={() => setSelectedRecipe(day.dinner)} 
            />
          </div>
        </section>

        {/* Checklist */}
        <section className="bg-white border border-border/50 rounded-[2rem] p-6 shadow-sm">
          <h2 className="font-display text-xl text-foreground mb-6">Checklist del día</h2>
          
          <div className="space-y-4 mb-6">
            {tasks.map((task, i) => (
              <div key={i} className="flex items-center gap-3">
                {task.done ? (
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground/30 shrink-0" />
                )}
                <span className={`text-[16px] font-medium ${task.done ? 'text-foreground line-through opacity-70' : 'text-foreground'}`}>
                  {task.name}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-black/5 rounded-xl p-4 flex items-center justify-between">
            <div className="text-sm font-bold text-foreground">{completedTasks} de {totalTasks} completadas</div>
            <div className="text-sm font-bold text-primary">{progressPercent}%</div>
          </div>
        </section>

        {/* Success Conclusion Card */}
        {completedTasks === totalTasks && (
          <section className="animate-in zoom-in duration-500 rounded-[2rem] bg-gradient-to-br from-primary to-primary/80 p-8 text-center text-white shadow-2xl shadow-primary/30">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <PartyPopper className="h-8 w-8 text-white" />
            </div>
            <h2 className="font-display text-3xl mb-2">¡Día completado!</h2>
            <p className="text-white/90 font-medium mb-8">Excelente trabajo. Estás un paso más cerca de tu objetivo.</p>
            <button className="w-full bg-white text-primary py-4 rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-transform shadow-lg">
              Continuar
            </button>
          </section>
        )}
        
        {/* Gamification Badges (Mocked for visual) */}
        {day.dayNumber >= 7 && (
           <div className="flex items-center gap-4 bg-[#FFF9E6] border border-[#FFE082] p-4 rounded-2xl">
              <div className="bg-[#FFC107] text-white p-3 rounded-full">
                 <Trophy className="h-6 w-6" />
              </div>
              <div>
                 <div className="text-sm font-bold text-[#FF8F00]">Medalla Desbloqueada</div>
                 <div className="text-[16px] font-medium text-foreground">Constancia 7 días</div>
              </div>
           </div>
        )}

      </div>

      {selectedRecipe && (
        <FullScreenRecipeModal 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
          isPrepared={
            selectedRecipe.id.startsWith('bf_') ? !!progress?.breakfast_done :
            selectedRecipe.id.startsWith('lu_') ? !!progress?.lunch_done :
            !!progress?.dinner_done
          }
          onMarkPrepared={() => {
            if (selectedRecipe.id.startsWith('bf_')) handleMarkMeal('breakfast');
            if (selectedRecipe.id.startsWith('lu_')) handleMarkMeal('lunch');
            if (selectedRecipe.id.startsWith('dn_')) handleMarkMeal('dinner');
          }}
        />
      )}
    </AppShell>
  );
}

function MealCard({ recipe, isDone, onOpen }: { recipe: RecipeDef, isDone: boolean, onOpen: () => void }) {
  return (
    <div className={`overflow-hidden rounded-[2rem] border transition-all ${isDone ? 'border-primary bg-primary/5' : 'border-border/50 bg-white shadow-sm'}`}>
      <div className="relative h-48 w-full">
        <img src={recipe.image} alt={recipe.name} className={`h-full w-full object-cover transition-all ${isDone ? 'opacity-80 grayscale-[30%]' : ''}`} />
        <div className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-foreground backdrop-blur-sm">
          {recipe.label}
        </div>
        {isDone && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[2px]">
             <div className="bg-white rounded-full p-2 shadow-xl">
               <CheckCircle2 className="h-8 w-8 text-primary" />
             </div>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="font-display text-xl text-foreground leading-tight mb-3">{recipe.name}</h3>
        
        <div className="flex gap-3 mb-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-accent/10 text-accent px-2.5 py-1 rounded-md">
            <Clock className="h-3.5 w-3.5" /> {recipe.prepTimeMin} min
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-orange-100 text-orange-600 px-2.5 py-1 rounded-md">
            <Flame className="h-3.5 w-3.5" /> {recipe.kcal} kcal
          </div>
        </div>

        <button
          onClick={onOpen}
          className="w-full flex items-center justify-center py-3.5 rounded-xl bg-foreground text-background text-sm font-bold active:scale-[0.98] transition-transform"
        >
          Ver receta
        </button>
      </div>
    </div>
  );
}
