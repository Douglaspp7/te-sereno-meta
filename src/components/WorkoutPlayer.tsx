import { useState, useEffect } from "react";
import { X, Play, Pause, FastForward, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkoutPlayer({
  open,
  onClose,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  const TOTAL_TIME = 60; // 60 seconds workout mock
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isPlaying, setIsPlaying] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (open) {
      setTimeLeft(TOTAL_TIME);
      setIsPlaying(true);
      setFinished(false);
    } else {
      setIsPlaying(false);
    }
  }, [open]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !finished) {
      setFinished(true);
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft, finished]);

  if (!open) return null;

  const progressPct = ((TOTAL_TIME - timeLeft) / TOTAL_TIME) * 100;
  
  // Format MM:SS
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#F8FAF8] animate-in slide-in-from-bottom-full duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button onClick={onClose} className="rounded-full bg-white p-2 shadow-sm active:scale-95">
          <X className="h-6 w-6 text-foreground" />
        </button>
        <p className="font-bold uppercase tracking-widest text-muted-foreground text-[11px]">
          {finished ? "Completado" : "1 de 3 Ejercicios"}
        </p>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center px-6 pb-12">
        
        {finished ? (
          <div className="flex flex-1 flex-col items-center justify-center animate-in zoom-in-50 duration-500">
            <div className="rounded-full bg-primary/20 p-6 mb-6">
              <CheckCircle2 className="h-24 w-24 text-primary" />
            </div>
            <h2 className="font-display text-3xl font-extrabold text-foreground mb-2">¡Increíble!</h2>
            <p className="text-center text-muted-foreground font-medium max-w-[250px]">
              Has quemado aproximadamente <strong className="text-orange-500">120 kcal</strong>. Sigue así.
            </p>
          </div>
        ) : (
          <>
            {/* Exercise Animation Placeholder */}
            <div className="relative mt-4 h-64 w-full max-w-sm overflow-hidden rounded-[2rem] bg-white border border-border/50 shadow-sm flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/5" />
              <img 
                src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80" 
                alt="Exercise" 
                className="h-full w-full object-cover opacity-80 mix-blend-multiply"
              />
              <div className="absolute bottom-4 right-4 rounded-xl bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                Polichinelos
              </div>
            </div>

            <div className="mt-12 w-full max-w-sm flex flex-col items-center">
              {/* Circular Timer */}
              <div className="relative flex h-48 w-48 items-center justify-center">
                <svg className="absolute inset-0 h-full w-full -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                  <circle
                    cx="96" cy="96" r="88"
                    stroke="#4F8A5B" strokeWidth="8" fill="none" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 88}
                    strokeDashoffset={2 * Math.PI * 88 * (1 - progressPct / 100)}
                    className="transition-all duration-1000 linear"
                  />
                </svg>
                <p className="font-display text-5xl font-extrabold tabular-nums text-foreground">{timeStr}</p>
              </div>

              {/* Controls */}
              <div className="mt-12 flex items-center gap-6">
                <button 
                  onClick={() => setTimeLeft(0)}
                  className="grid h-14 w-14 place-items-center rounded-full bg-white shadow-sm border border-border/50 active:scale-95 text-muted-foreground"
                >
                  <FastForward className="h-6 w-6" />
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="grid h-20 w-20 place-items-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 active:scale-95"
                >
                  {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                </button>
                <button 
                  onClick={() => {}}
                  className="grid h-14 w-14 place-items-center rounded-full opacity-50 cursor-not-allowed text-muted-foreground"
                >
                   {/* Ghost button for symmetry */}
                </button>
              </div>
            </div>
          </>
        )}
        
      </div>

      {/* Footer Button */}
      {finished && (
        <div className="p-6">
          <button 
            onClick={() => {
              onComplete();
              onClose();
            }}
            className="w-full rounded-[1.5rem] bg-primary py-4 text-lg font-bold text-white shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
          >
            Finalizar Entrenamiento
          </button>
        </div>
      )}
    </div>
  );
}
