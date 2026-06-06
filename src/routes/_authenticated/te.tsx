import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Leaf, Droplet, Flame, Coffee, Check, Heart, PlayCircle, Lock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo, useRef } from "react";
import confetti from "canvas-confetti";
import { teas, TeaCategory } from "@/data/teas";

export const Route = createFileRoute("/_authenticated/te")({
  component: TeDelDiaPage,
});

function TeDelDiaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Obter usuário logado
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
  });

  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const currentLogDate = getLocalDateString();

  // Fetch ALL Daily Progress
  const { data: allProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["all_daily_progress", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_progress")
        .select("id, day_number, water_glasses")
        .eq("user_id", user?.id || "");

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Calcular dia desbloqueado
  const unlockedDay = useMemo(() => {
    if (!allProgress || allProgress.length === 0) return 1;
    const completedDays = allProgress.filter(p => (p.water_glasses || 0) > 0).map(p => p.day_number || 1);
    if (completedDays.length === 0) return 1;
    return Math.min(21, Math.max(...completedDays) + 1);
  }, [allProgress]);

  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);

  // Sync automatically to the highest unlocked day when loaded or updated
  useEffect(() => {
    if (unlockedDay > selectedDayNum) {
      setSelectedDayNum(unlockedDay);
    }
  }, [unlockedDay]);

  const currentProgress = allProgress?.find(p => p.day_number === selectedDayNum);
  const isDone = (currentProgress?.water_glasses || 0) > 0;

  // Auto-scroll timeline to active day
  useEffect(() => {
    if (!isLoadingProgress && timelineRef.current) {
      setTimeout(() => {
        if (!timelineRef.current) return;
        const activeElement = timelineRef.current.children[selectedDayNum - 1] as HTMLElement;
        if (activeElement) {
          const container = timelineRef.current;
          const scrollLeft = activeElement.offsetLeft - container.offsetWidth / 2 + activeElement.offsetWidth / 2;
          container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
        }
      }, 100);
    }
  }, [selectedDayNum, isLoadingProgress]);

  const upsertProgress = useMutation({
    mutationFn: async (newValue: boolean) => {
      const { error } = await supabase.from("daily_progress").upsert({
        user_id: user?.id || "",
        day_number: selectedDayNum,
        log_date: currentLogDate,
        water_glasses: newValue ? 1 : 0, // Reuse water_glasses for tea
        ...(currentProgress?.id ? { id: currentProgress.id } : {})
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all_daily_progress", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["daily_progress"] });
    },
  });

  const handleComplete = () => {
    const newValue = !isDone;
    upsertProgress.mutate(newValue);
    if (newValue) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#34d399", "#059669", "#fbbf24"],
      });
    }
  };

  const tea = teas.find(t => t.day === selectedDayNum) || teas[0];

  const categoryIcons: Record<TeaCategory, React.ReactNode> = {
    'Energía': <Flame className="h-5 w-5 text-orange-500" />,
    'Digestión': <Leaf className="h-5 w-5 text-green-500" />,
    'Relajación': <Coffee className="h-5 w-5 text-indigo-400" />,
    'Bienestar': <Droplet className="h-5 w-5 text-cyan-500" />
  };

  if (!user || isLoadingProgress) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Imagem Herói com botão Voltar */}
      <div className="relative h-[40vh] w-full bg-muted">
        <img 
          src={`/images/teas/tea_${tea.day}.jpg`} 
          alt={tea.name} 
          className="h-full w-full object-cover" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?q=80&w=1000&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />
        <button 
          onClick={() => navigate({ to: "/" })}
          className="absolute top-6 left-4 h-12 w-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-10"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <button className="absolute top-6 right-4 h-12 w-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-10">
          <Heart className="h-5 w-5" />
        </button>
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold bg-primary/80 text-white px-3 py-1 rounded-full backdrop-blur-sm">
              Día {tea.day} de 21
            </span>
            <span className="text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
              {categoryIcons[tea.category]} {tea.category}
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white drop-shadow-lg leading-tight mb-2">
            {tea.name}
          </h1>
          <p className="text-white/90 text-sm">{tea.shortDescription}</p>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8 bg-background relative -mt-6 rounded-t-[2rem]">
        
        {/* Detalhes Rápidos */}
        <div className="flex justify-between items-center bg-secondary/30 p-4 rounded-2xl border border-border/50">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Horario</p>
            <p className="font-bold text-sm text-foreground">{tea.recommendedTime}</p>
          </div>
          <div className="w-px h-8 bg-border"></div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Dificultad</p>
            <p className="font-bold text-sm text-foreground">{tea.difficulty}</p>
          </div>
          <div className="w-px h-8 bg-border"></div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Tiempo</p>
            <p className="font-bold text-sm text-foreground">{tea.prepTime}</p>
          </div>
        </div>

        {/* Botão de Concluir */}
        <button 
          onClick={handleComplete}
          disabled={upsertProgress.isPending}
          className={`w-full rounded-[1.5rem] py-4 text-sm font-bold active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-lg ${
            isDone 
              ? "bg-primary/10 text-primary border-2 border-primary/20 shadow-none" 
              : "bg-foreground text-background hover:bg-foreground/90 shadow-foreground/20"
          }`}
        >
          {upsertProgress.isPending ? (
            "Guardando..."
          ) : isDone ? (
            <>
              <Check className="h-5 w-5" strokeWidth={3} /> Té consumido
            </>
          ) : (
            "Marcar como consumido"
          )}
        </button>

        {/* Ingredientes */}
        <div>
          <h3 className="font-display font-bold text-xl mb-4 text-foreground flex items-center gap-2">
            Ingredientes
          </h3>
          <ul className="space-y-3">
            {tea.ingredients.map((ingredient, idx) => (
              <li key={idx} className="flex items-start gap-3 bg-card p-3 rounded-xl border border-border/50 shadow-sm">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold">{idx + 1}</span>
                </div>
                <span className="text-foreground text-sm font-medium leading-relaxed">{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Preparación */}
        <div>
          <h3 className="font-display font-bold text-xl mb-4 text-foreground">
            Preparación
          </h3>
          <div className="space-y-4">
            {tea.instructions.map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-secondary text-foreground flex items-center justify-center font-display font-bold shrink-0">
                    {idx + 1}
                  </div>
                  {idx < tea.instructions.length - 1 && (
                    <div className="w-0.5 h-full bg-border my-2"></div>
                  )}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed pt-1 pb-4">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Consejo del Día */}
        <div className="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <Flame className="w-32 h-32 text-amber-500" />
          </div>
          <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
            💡 Consejo del día
          </h4>
          <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed relative z-10">
            {tea.tipOfTheDay}
          </p>
        </div>

        {/* Beneficios */}
        <div>
          <h3 className="font-display font-bold text-xl mb-4 text-foreground">Ideal para</h3>
          <div className="grid grid-cols-2 gap-3">
            {tea.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-secondary/50 p-3 rounded-xl border border-border/50">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-semibold text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 21 Days Timeline */}
        <div className="pt-6 border-t border-border">
          <h4 className="font-display font-bold text-lg mb-4 text-foreground flex items-center justify-between">
            <span>Tu Ruta de Tés</span>
            <span className="text-sm font-normal text-muted-foreground">{selectedDayNum}/21</span>
          </h4>
          <div ref={timelineRef} className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {Array.from({ length: 21 }, (_, i) => i + 1).map((d) => {
              const isPast = d < unlockedDay;
              const isCurrent = d === selectedDayNum;
              const isLocked = d > unlockedDay;
              
              return (
                <div 
                  key={d} 
                  onClick={() => {
                    if (!isLocked) setSelectedDayNum(d);
                  }}
                  className={`shrink-0 w-20 h-24 rounded-2xl flex flex-col items-center justify-center snap-center border transition-all ${
                    !isLocked ? 'cursor-pointer hover:bg-secondary/80' : ''
                  } ${
                    isCurrent 
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-105 hover:bg-primary/90' 
                      : isPast 
                        ? 'bg-secondary/50 border-border text-foreground' 
                        : 'bg-secondary/20 border-border/50 text-muted-foreground opacity-60'
                  }`}
                >
                  <span className="text-xs font-medium mb-1 opacity-80">Día</span>
                  <span className={`text-2xl font-black ${isLocked ? 'opacity-50' : ''}`}>{d}</span>
                  <div className="mt-2">
                    {isCurrent && <PlayCircle className="h-5 w-5 fill-white text-primary" />}
                    {isPast && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    {isLocked && <Lock className="h-4 w-4 opacity-50" />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
