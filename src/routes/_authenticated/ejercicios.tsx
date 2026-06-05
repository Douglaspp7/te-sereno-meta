import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { PlayCircle, Clock, Flame, Check } from "lucide-react";
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

  // 1. Fetch Daily Progress
  const { data: progress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["daily_progress", user?.id, currentLogDate],
    queryRefetchInterval: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_progress")
        .select("*")
        .eq("user_id", user?.id)
        .eq("log_date", currentLogDate)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const dayNumber = progress?.day_number ?? 1;

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
        .eq("day_number", dayNumber)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!dayNumber,
  });

  const upsertProgress = useMutation({
    mutationFn: async (updates: any) => {
      if (progress?.id) {
        const { error } = await supabase
          .from("daily_progress")
          .update(updates)
          .eq("id", progress.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("daily_progress")
          .insert([{ user_id: user?.id, log_date: currentLogDate, day_number: 1, ...updates }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily_progress", user?.id, currentLogDate] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_stats"] });
    },
  });

  const handleComplete = () => {
    if (!progress?.exercise_done) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#34d399", "#10b981", "#059669"],
      });
      upsertProgress.mutate({ exercise_done: true });
    } else {
      upsertProgress.mutate({ exercise_done: false });
    }
  };

  const exercise = dayData?.exercises;
  const isDone = progress?.exercise_done;
  let videoUrl = exercise?.video_url;
  
  // Forçar os URLs de vídeo independentemente do banco de dados (para Dias 1 e 2)
  if (dayNumber === 1) {
    videoUrl = 'https://youtu.be/YFAuNBwvugY';
  }
  if (dayNumber === 2) {
    videoUrl = 'https://youtu.be/21C7hlYOnwE';
  }

  // Se o URL não for youtube/vimeo e parecer um path de imagem (ex: /images/caminar_20.png)
  const isImageUrl = videoUrl && (videoUrl.endsWith('.png') || videoUrl.endsWith('.jpg') || videoUrl.endsWith('.jpeg'));

  return (
    <AppShell>
      <PageHeader title="Ejercicios" subtitle={`Rutina del Día ${dayNumber}`} />
      
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
                <h3 className="font-display font-bold text-2xl text-foreground leading-tight">Día {dayNumber}</h3>
                
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
