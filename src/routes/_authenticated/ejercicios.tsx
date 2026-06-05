import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { PlayCircle, Clock, Flame, Check, Lock, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/lib/auth";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/_authenticated/ejercicios")({
  component: EjerciciosPage,
});

function EjerciciosPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Evitar hydration errors com react-player
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const currentLogDate = getLocalDateString();

  // 1. Fetch ALL Daily Progress to calculate unlocked day
  const { data: allProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["all_daily_progress", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_progress")
        .select("id, day_number, exercise_done")
        .eq("user_id", user?.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const unlockedDay = React.useMemo(() => {
    if (!allProgress || allProgress.length === 0) return 1;
    const completedDays = allProgress.filter(p => p.exercise_done).map(p => p.day_number || 1);
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
  const isDone = currentProgress?.exercise_done || false;

  // 2. Fetch Exercise for the Day
  const { data: dayData, isLoading: isLoadingExercise } = useQuery({
    queryKey: ["day_exercise", dayNumber],
    queryRefetchInterval: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("days")
        .select(`
          day_number,
          exercises (
            id,
            name,
            description,
            duration,
            video_url
          )
        `)
        .eq("day_number", selectedDayNum)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedDayNum,
  });

  const exercise = dayData?.exercises;

  const upsertProgress = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("daily_progress").upsert({
        user_id: user?.id,
        day_number: selectedDayNum,
        log_date: currentLogDate,
        exercise_done: true,
        ...(currentProgress?.id ? { id: currentProgress.id } : {})
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all_daily_progress", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_stats"] });
    },
  });

  const handleComplete = () => {
    if (!isDone) {
      upsertProgress.mutate();
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#a855f7", "#ec4899", "#10b981"],
      });
    }
  };

  let videoUrl = exercise?.video_url;

  // Helper para converter URL do YouTube em Embed URL seguro
  const getEmbedUrl = (url: string | undefined) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
    }
    return url;
  };
  
  const VIDEO_LINKS: Record<number, string> = {
    1: 'https://youtu.be/YFAuNBwvugY',
    2: 'https://youtu.be/21C7hlYOnwE',
    3: 'https://youtu.be/LZORkCJf9ow',
    4: 'https://youtu.be/B4Ef_BaAZuk',
    5: 'https://youtu.be/qeFt1gZeOWg',
    6: 'https://youtu.be/-HZvbHUot78',
    7: 'https://youtu.be/tz0ffHMmloQ',
    8: 'https://youtu.be/9kKZII96YPc',
    9: 'https://youtu.be/75S19ireC0w',
    10: 'https://youtu.be/9o0UPuDBM8M',
    11: 'https://youtu.be/e6C0Ia5Cazo',
    12: 'https://youtu.be/bVNDdQ7xc5U',
    13: 'https://youtu.be/YhGrKAOT-rQ',
    14: 'https://youtu.be/coy1trQFQCU',
    15: 'https://youtu.be/07UozcXXOXY',
    16: 'https://youtu.be/_fBLOyRbzzs',
    17: 'https://youtu.be/39PzNPzDL_g',
    18: 'https://youtu.be/d-TjzCjVBLg',
    19: 'https://youtu.be/5lDNqN7eZ4A',
    20: 'https://youtu.be/hEt3YCJILOs',
    21: 'https://youtu.be/2sHRAQO4J8k',
  };
  
  // Forçar os URLs de vídeo mapeados, caso contrário, usa o do banco de dados
  if (VIDEO_LINKS[selectedDayNum]) {
    videoUrl = VIDEO_LINKS[selectedDayNum];
  }

  // Se o URL não for youtube/vimeo e parecer um path de imagem (ex: /images/caminar_20.png)
  const isImageUrl = videoUrl && (videoUrl.endsWith('.png') || videoUrl.endsWith('.jpg') || videoUrl.endsWith('.jpeg'));
  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <AppShell>
      <PageHeader title="Ejercicios" subtitle={`Rutina del Día ${selectedDayNum}`} />
      
      <div className="px-5 mt-2 pb-10 space-y-6">
        <div className="rounded-[2rem] border border-border/40 bg-white p-5 shadow-sm overflow-hidden relative">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          
          {isLoadingProgress || isLoadingExercise ? (
            <div className="aspect-video w-full rounded-2xl bg-secondary animate-pulse mb-4" />
          ) : exercise ? (
            <>
              {/* Video Player Area */}
              <div className="aspect-video w-full rounded-2xl bg-black/5 flex items-center justify-center relative overflow-hidden mb-5 border border-border/50 shadow-inner group">
                {isClient && videoUrl && !isImageUrl ? (
                  <div className="absolute inset-0 z-10 w-full h-full bg-black/90">
                    <iframe
                      className="w-full h-full"
                      src={embedUrl}
                      title="Video Player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <>
                    {/* Fallback image / Mockup when there's no real video URL */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070')] bg-cover bg-center opacity-70 transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                       <p className="text-white/90 text-sm font-bold shadow-black drop-shadow-md">
                         {isImageUrl ? "Sube tu enlace de YouTube aquí" : "Añade un enlace de vídeo"}
                       </p>
                    </div>
                  </>
                )}
              </div>

              {/* Info Area */}
              <div className="relative z-10">
                <h3 className="font-display font-bold text-2xl text-foreground leading-tight">Día {selectedDayNum}</h3>
                
                <div className="flex gap-3 mt-4 mb-6">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground bg-secondary/50 rounded-xl px-4 py-2 border border-border/50 backdrop-blur-sm">
                    <Clock className="h-4 w-4 text-primary" /> {exercise.duration} min
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground bg-secondary/50 rounded-xl px-4 py-2 border border-border/50 backdrop-blur-sm">
                    <Flame className="h-4 w-4 text-orange-500" /> ~{exercise.duration * 7} kcal
                  </div>
                </div>
                
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
                      <Check className="h-5 w-5" strokeWidth={3} /> Completado
                    </>
                  ) : (
                    "Marcar como completado"
                  )}
                </button>
              </div>

              {/* 21 Days Timeline */}
              <div className="mt-10 mb-2">
                <h4 className="font-display font-bold text-lg mb-4 text-foreground flex items-center justify-between">
                  <span>Tu Ruta de 21 Días</span>
                  <span className="text-sm font-normal text-muted-foreground">{selectedDayNum}/21</span>
                </h4>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
            </>
          ) : (
             <div className="py-10 text-center">
               <p className="text-muted-foreground font-bold">No hay ejercicios asignados para hoy.</p>
             </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
