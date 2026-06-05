import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { 
  Flame, Target, Clock, Heart, ArrowLeft, CheckCircle2, Droplet, 
  Sun, Sunset, Moon, Dumbbell, Sparkles, Utensils, ChevronLeft, ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/_authenticated/plan")({
  component: PlanPage,
});

function FullScreenRecipeModal({ 
  recipe, 
  onClose,
  isPrepared,
  onMarkPrepared
}: { 
  recipe: any | null, 
  onClose: () => void,
  isPrepared: boolean,
  onMarkPrepared: () => void
}) {
  if (!recipe) return null;

  // New Rich Data handling
  const ingredients = recipe.ingredients || {};
  const instructions = (recipe.instructions as string[]) || [];
  const cookingTips = (recipe.cooking_tips as string[]) || [];
  const substitutions = (recipe.substitutions as string[]) || [];
  const nutritionalBenefits = (recipe.nutritional_benefits as string[]) || [];
  const weightLossBenefits = (recipe.weight_loss_benefits as string[]) || [];

  // Fallback para gerar imagem de IA na hora caso não tenha no banco (Otimizado para Mobile: 600x800)
  const defaultImageUrl = `https://image.pollinations.ai/prompt/delicious%20${encodeURIComponent(recipe.name)}%20food%20photography%20hyperrealistic%20high%20resolution?width=600&height=800&nologo=true`;
  const imageUrl = recipe.image_url || defaultImageUrl;

  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="relative h-[35vh] w-full bg-muted">
        <img src={imageUrl} alt={recipe.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />
        <button 
          onClick={onClose}
          className="absolute top-6 left-4 h-12 w-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      <div className="px-6 py-8 space-y-8 bg-background relative -mt-8 rounded-t-[2.5rem] min-h-[70vh]">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">{recipe.meal_type}</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold text-foreground leading-tight">{recipe.name}</h2>
          
          {recipe.description && (
            <p className="mt-3 text-base font-medium text-muted-foreground leading-relaxed">
              {recipe.description}
            </p>
          )}

          <div className="flex gap-3 mt-5">
            <div className="flex items-center gap-1.5 text-sm font-bold text-foreground bg-secondary/30 px-4 py-2 rounded-2xl">
              <Clock className="h-4 w-4 text-muted-foreground" /> {recipe.prep_time} min
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-orange-600 bg-orange-100 px-4 py-2 rounded-2xl">
              <Flame className="h-4 w-4" /> {recipe.calories} kcal
            </div>
          </div>
        </div>

        {/* Nutritional Macros */}
        <div className="flex gap-4">
          <div className="flex-1 rounded-[1.5rem] bg-secondary/20 p-5 text-center border border-border/40 shadow-sm">
            <div className="text-2xl font-display font-black text-foreground">{recipe.proteins}<span className="text-sm font-bold text-muted-foreground ml-0.5">g</span></div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Proteína</div>
          </div>
          <div className="flex-1 rounded-[1.5rem] bg-secondary/20 p-5 text-center border border-border/40 shadow-sm">
            <div className="text-2xl font-display font-black text-foreground">{recipe.carbs}<span className="text-sm font-bold text-muted-foreground ml-0.5">g</span></div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Carbs</div>
          </div>
          <div className="flex-1 rounded-[1.5rem] bg-secondary/20 p-5 text-center border border-border/40 shadow-sm">
            <div className="text-2xl font-display font-black text-foreground">{recipe.fats}<span className="text-sm font-bold text-muted-foreground ml-0.5">g</span></div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Grasa</div>
          </div>
        </div>

        {/* Por qué es bueno para ti? (Beneficios) */}
        {(weightLossBenefits.length > 0 || nutritionalBenefits.length > 0) && (
          <div className="bg-emerald-50 rounded-[1.5rem] border border-emerald-100 p-6">
            <h3 className="font-display text-xl font-bold mb-4 text-emerald-800 flex items-center gap-2">
              <Heart className="h-5 w-5 text-emerald-500" /> Por qué es excelente
            </h3>
            <div className="space-y-4">
              {weightLossBenefits.map((ben, i) => (
                <div key={`wl-${i}`} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5"><Flame className="h-3 w-3" /></div>
                  <p className="text-sm text-emerald-900 font-medium leading-relaxed">{ben}</p>
                </div>
              ))}
              {nutritionalBenefits.map((ben, i) => (
                <div key={`n-${i}`} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5"><Sparkles className="h-3 w-3" /></div>
                  <p className="text-sm text-emerald-900 font-medium leading-relaxed">{ben}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients (Handles both flat arrays and sectioned objects) */}
        <div>
          <h3 className="font-display text-2xl font-bold mb-5 flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" /> Ingredientes
          </h3>
          
          {Array.isArray(ingredients) ? (
            <ul className="space-y-4">
              {ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary/60 mt-2 shrink-0" />
                  <span className="text-base text-foreground/90 font-medium leading-snug">{ing}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-6">
              {Object.entries(ingredients).map(([section, items]: [string, any]) => (
                <div key={section}>
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">{section}</h4>
                  <ul className="space-y-4">
                    {Array.isArray(items) && items.map((ing, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary/60 mt-2 shrink-0" />
                        <span className="text-base text-foreground/90 font-medium leading-snug">{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div>
          <h3 className="font-display text-2xl font-bold mb-5">Preparación paso a paso</h3>
          <ol className="space-y-6">
            {instructions.map((inst, i) => (
              <li key={i} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-black text-primary border border-primary/20">
                  {i + 1}
                </div>
                <p className="text-base text-foreground/90 leading-relaxed font-medium pt-1">{inst}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Chef Tips & Substitutions */}
        {(cookingTips.length > 0 || substitutions.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {cookingTips.length > 0 && (
              <div className="bg-orange-50 rounded-[1.5rem] border border-orange-100 p-5">
                <h4 className="font-bold text-orange-800 flex items-center gap-2 mb-3"><Flame className="h-4 w-4" /> Tips del Chef</h4>
                <ul className="space-y-2 text-sm text-orange-900 font-medium">
                  {cookingTips.map((tip, i) => <li key={i}>• {tip}</li>)}
                </ul>
              </div>
            )}
            {substitutions.length > 0 && (
              <div className="bg-blue-50 rounded-[1.5rem] border border-blue-100 p-5">
                <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-3"><ArrowLeft className="h-4 w-4" /> Sustituciones</h4>
                <ul className="space-y-2 text-sm text-blue-900 font-medium">
                  {substitutions.map((sub, i) => <li key={i}>• {sub}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="pt-6 pb-12 space-y-4">
          <button 
            onClick={() => {
              if (!isPrepared) {
                onMarkPrepared();
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#34d399', '#10b981', '#ffffff'] });
              }
              onClose();
            }}
            className={`w-full flex items-center justify-center gap-2 py-5 rounded-[1.5rem] font-bold text-lg active:scale-[0.98] transition-all shadow-lg ${
              isPrepared 
                ? "bg-secondary text-muted-foreground shadow-none" 
                : "bg-primary text-white shadow-primary/40 hover:bg-primary/90"
            }`}
          >
            {isPrepared ? (
              <><CheckCircle2 className="h-6 w-6" /> Completada</>
            ) : (
              <><CheckCircle2 className="h-6 w-6" /> Marcar como Completada</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanPage() {
  const qc = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  
  // Real dates vs Plan dates logic
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const currentLogDate = new Date().toISOString().split("T")[0]; // Today in YYYY-MM-DD
  
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null);

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

  // Calculate actual current day based on profile start
  useEffect(() => {
    if (profile?.plan_started_at && selectedDayNum === 1) { // Only set once on load if it's 1
      const start = new Date(profile.plan_started_at);
      const today = new Date();
      const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const calculatedDay = Math.min(21, Math.max(1, diff + 1));
      setSelectedDayNum(calculatedDay);
    }
  }, [profile]);

  const { data: day, isLoading: isDayLoading } = useQuery({
    queryKey: ["day", selectedDayNum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('days')
        .select(`
          *,
          breakfast:recipes!days_breakfast_recipe_id_fkey(*),
          lunch:recipes!days_lunch_recipe_id_fkey(*),
          dinner:recipes!days_dinner_recipe_id_fkey(*),
          exercise:exercises!days_exercise_id_fkey(*)
        `)
        .eq('day_number', selectedDayNum)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    }
  });

  const { data: progress } = useQuery({
    queryKey: ["daily_progress", userId, selectedDayNum],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from("daily_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("day_number", selectedDayNum)
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
        day_number: selectedDayNum,
        log_date: new Date().toISOString().split("T")[0], // Always save current day
        ...progress,
        ...updates,
      }, { onConflict: 'user_id,day_number' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["daily_progress", userId, selectedDayNum] });
      qc.invalidateQueries({ queryKey: ["daily_progress", userId] }); // Global invalidate for Dashboard
    }
  });

  const handleCompleteMission = () => {
    if (progress?.mission_done) return;
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#A7E154', '#55C4A6', '#FFFFFF'] });
    updateProgress.mutate({ mission_done: true });
  };

  if (isDayLoading || !day) {
    return (
      <AppShell>
         <div className="flex items-center justify-center h-full p-8 text-muted-foreground animate-pulse">
            Preparando tu agenda...
         </div>
      </AppShell>
    );
  }

  // Calculate Daily Completion Percentage
  const tasks = [
    { done: progress?.breakfast_done },
    { done: progress?.lunch_done },
    { done: progress?.dinner_done },
    { done: progress?.mission_done },
    { done: (progress?.water_glasses || 0) >= (day?.water_goal || 8) },
    { done: progress?.exercise_done },
  ];
  const completedTasks = tasks.filter(t => t.done).length;
  const progressPercent = Math.round((completedTasks / tasks.length) * 100);

  // Format date nicely
  const displayDate = new Date();
  // Adjust display date if selectedDayNum is not today
  // (Optional logic, let's just show "Hoy" or relative date)
  const dateString = displayDate.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' });
  const formattedDate = dateString.charAt(0).toUpperCase() + dateString.slice(1);

  return (
    <AppShell>
      {/* HEADER: Focus on Today */}
      <div className="px-5 pt-10 pb-6 bg-background sticky top-0 z-10 backdrop-blur-xl bg-opacity-90 border-b border-border/30">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => setSelectedDayNum(Math.max(1, selectedDayNum - 1))}
            disabled={selectedDayNum === 1}
            className="p-2 rounded-full bg-secondary/50 text-foreground disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <h1 className="font-display text-2xl font-black text-foreground">Día {day.day_number}</h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{formattedDate}</p>
          </div>
          
          <button 
            onClick={() => setSelectedDayNum(Math.min(21, selectedDayNum + 1))}
            disabled={selectedDayNum === 21}
            className="p-2 rounded-full bg-secondary/50 text-foreground disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Daily Progress Bar */}
        <div className="mt-5">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Progreso del Día</span>
            <span className="text-sm font-black text-primary">{progressPercent}%</span>
          </div>
          <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </div>
      </div>

      <div className="px-5 pb-24 space-y-10 mt-6 relative">
        {/* Decorative Timeline Line */}
        <div className="absolute left-9 top-4 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-border to-transparent -z-10" />

        {/* 🌅 MAÑANA */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0 border-4 border-background z-10">
              <Sun className="h-4 w-4" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">Mañana</h3>
          </div>

          <div className="pl-11 space-y-4">
            {/* Mission */}
            <button
              onClick={handleCompleteMission}
              className={`w-full text-left p-5 rounded-[1.5rem] border transition-all ${
                progress?.mission_done 
                  ? "bg-muted border-border/50 opacity-80" 
                  : "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-sm active:scale-[0.98]"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Misión Diaria
                </span>
                <div className={`h-6 w-6 rounded-full border-2 grid place-items-center transition-colors ${progress?.mission_done ? "bg-primary border-primary text-white" : "border-muted-foreground/30 bg-background"}`}>
                  {progress?.mission_done && <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={3} />}
                </div>
              </div>
              <p className={`text-base font-bold leading-snug ${progress?.mission_done ? "text-muted-foreground line-through decoration-muted-foreground/50" : "text-foreground"}`}>
                {day.mission}
              </p>
            </button>

            {/* Breakfast */}
            {day.breakfast && (
              <TimelineMealCard 
                recipe={day.breakfast as any} 
                isDone={!!progress?.breakfast_done}
                onOpen={() => { setSelectedRecipe(day.breakfast); setSelectedMealType('breakfast'); }} 
              />
            )}
          </div>
        </div>

        {/* ☀️ TARDE */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center shrink-0 border-4 border-background z-10">
              <Sunset className="h-4 w-4" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">Tarde</h3>
          </div>

          <div className="pl-11 space-y-4">
            {/* Lunch */}
            {day.lunch && (
              <TimelineMealCard 
                recipe={day.lunch as any} 
                isDone={!!progress?.lunch_done}
                onOpen={() => { setSelectedRecipe(day.lunch); setSelectedMealType('lunch'); }} 
              />
            )}

            {/* Exercise */}
            {day.exercise && (
               <button
                 onClick={() => {
                   if(!progress?.exercise_done) {
                     confetti({ particleCount: 100, origin: { y: 0.6 } });
                     updateProgress.mutate({ exercise_done: true });
                   }
                 }}
                 className={`w-full text-left p-5 rounded-[1.5rem] border flex items-center gap-4 transition-all ${
                   progress?.exercise_done 
                     ? "bg-muted border-border/50 opacity-80" 
                     : "bg-white border-border/60 shadow-sm active:scale-[0.98]"
                 }`}
               >
                 <div className={`h-12 w-12 rounded-2xl grid place-items-center shrink-0 ${progress?.exercise_done ? "bg-secondary text-muted-foreground" : "bg-indigo-100 text-indigo-500"}`}>
                   <Dumbbell className="h-6 w-6" />
                 </div>
                 <div className="flex-1">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-0.5">Entrenamiento</p>
                   <p className={`text-sm font-bold leading-tight ${progress?.exercise_done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                     {day.exercise.name}
                   </p>
                   <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                     <Clock className="h-3 w-3" /> {day.exercise.duration} min
                   </p>
                 </div>
                 <div className={`h-6 w-6 rounded-full border-2 grid place-items-center transition-colors ${progress?.exercise_done ? "bg-primary border-primary text-white" : "border-muted-foreground/30 bg-background"}`}>
                    {progress?.exercise_done && <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={3} />}
                 </div>
               </button>
            )}
          </div>
        </div>

        {/* 💧 ÁGUA MODULE */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-cyan-100 text-cyan-500 flex items-center justify-center shrink-0 border-4 border-background z-10">
              <Droplet className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between flex-1">
              <h3 className="font-display text-xl font-bold text-foreground">Hidratación</h3>
              <span className="text-xs font-bold bg-cyan-100 text-cyan-600 px-3 py-1 rounded-full">
                {progress?.water_glasses || 0} / {day.water_goal || 8}
              </span>
            </div>
          </div>

          <div className="pl-11">
            <div className="bg-white rounded-[1.5rem] border border-border/50 p-5 shadow-sm">
              <div className="flex flex-wrap gap-2.5 justify-center">
                {Array.from({ length: day.water_goal || 8 }).map((_, i) => {
                  const isFilled = i < (progress?.water_glasses || 0);
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        const newVal = isFilled ? i : i + 1; // Toggle logic: if clicking filled, reduce to that amount. If clicking empty, fill up to that amount.
                        updateProgress.mutate({ water_glasses: newVal });
                        if(newVal > (progress?.water_glasses || 0)) {
                           // small confetti for water
                           confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 }, colors: ['#06b6d4', '#67e8f9'] });
                        }
                      }}
                      className={`h-11 w-9 rounded-full flex items-end justify-center pb-2 transition-all active:scale-90 ${
                        isFilled 
                          ? "bg-cyan-500 shadow-md shadow-cyan-500/30" 
                          : "bg-secondary hover:bg-secondary/80 border border-border/40"
                      }`}
                    >
                      <Droplet className={`h-4 w-4 ${isFilled ? "text-white" : "text-muted-foreground/30"}`} fill={isFilled ? "currentColor" : "none"} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 🌙 NOCHE */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 border-4 border-background z-10">
              <Moon className="h-4 w-4" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">Noche</h3>
          </div>

          <div className="pl-11 space-y-4">
            {/* Dinner */}
            {day.dinner && (
              <TimelineMealCard 
                recipe={day.dinner as any} 
                isDone={!!progress?.dinner_done}
                onOpen={() => { setSelectedRecipe(day.dinner); setSelectedMealType('dinner'); }} 
              />
            )}

            {/* Motivation Tip */}
            {day.tip && (
              <div className="rounded-[1.5rem] border border-border/40 bg-white p-5 shadow-sm">
                <div className="flex gap-4">
                  <div className="text-2xl pt-1">💡</div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Inspiración</div>
                    <p className="text-sm font-medium text-foreground leading-relaxed">
                      {day.tip}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <FullScreenRecipeModal 
          recipe={selectedRecipe} 
          isPrepared={
            (selectedMealType === 'breakfast' && !!progress?.breakfast_done) ||
            (selectedMealType === 'lunch' && !!progress?.lunch_done) ||
            (selectedMealType === 'dinner' && !!progress?.dinner_done)
          }
          onMarkPrepared={() => {
            if (selectedMealType === 'breakfast') updateProgress.mutate({ breakfast_done: true });
            if (selectedMealType === 'lunch') updateProgress.mutate({ lunch_done: true });
            if (selectedMealType === 'dinner') updateProgress.mutate({ dinner_done: true });
          }}
          onClose={() => setSelectedRecipe(null)} 
        />
      )}
    </AppShell>
  );
}

// Sub-component for Timeline Meals
function TimelineMealCard({ recipe, isDone, onOpen }: { recipe: any, isDone: boolean, onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className={`w-full group flex overflow-hidden rounded-[1.5rem] border bg-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] ${
        isDone ? "opacity-80 border-border/50" : "border-border/60"
      }`}
    >
      <div className="relative w-28 shrink-0 bg-muted">
        <img src={recipe.image_url} alt={recipe.name} className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${isDone ? 'grayscale opacity-70' : ''}`} />
        {isDone && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[2px]">
            <CheckCircle2 className="h-8 w-8 text-white drop-shadow-md" />
          </div>
        )}
      </div>
      <div className="flex-1 p-4 text-left flex flex-col justify-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{recipe.meal_type}</p>
        <p className={`text-sm font-bold leading-tight mb-2 ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
          {recipe.name}
        </p>
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="flex items-center gap-1 text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full"><Flame className="h-3 w-3" /> {recipe.calories}</span>
          <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {recipe.prep_time}m</span>
        </div>
      </div>
    </button>
  );
}
