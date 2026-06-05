import { Link } from "@tanstack/react-router";
import { CheckCircle2, Clock } from "lucide-react";
import { teas } from "@/data/teas";

export function TeDelDiaCard({ currentDayNum, isDone }: { currentDayNum: number, isDone: boolean }) {
  const tea = teas.find(t => t.day === currentDayNum) || teas[0];

  return (
    <div className="mb-8 mt-6 relative overflow-hidden rounded-[2rem] border border-border shadow-md bg-white">
      {/* Imagem de Fundo Premium */}
      <div className="relative h-48 w-full bg-muted">
        <img 
          src={`/images/teas/tea_${tea.day}.jpg`} 
          alt={tea.name} 
          className="h-full w-full object-cover" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=1000&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Selo de Concluído no Canto */}
        {isDone && (
          <div className="absolute top-4 right-4 bg-primary text-white p-1.5 rounded-full shadow-lg backdrop-blur-md">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        )}

        <div className="absolute bottom-4 left-5 right-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-1 flex items-center gap-1.5">
            <span className="text-sm">🍵</span> Té del Día
          </p>
          <h3 className={`font-display text-2xl font-bold text-white drop-shadow-md leading-tight ${isDone ? "opacity-80" : ""}`}>
            {tea.name}
          </h3>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm text-muted-foreground mb-4">
          {tea.shortDescription}
        </p>

        {/* Beneficios Visuais */}
        <div className="flex gap-2 flex-wrap mb-5">
          {tea.benefits.slice(0, 3).map((b, i) => (
            <span key={i} className="text-xs font-semibold bg-secondary/80 text-foreground px-2.5 py-1 rounded-lg border border-border/50">
              {b}
            </span>
          ))}
        </div>

        <Link
          to="/te"
          className={`w-full py-3.5 rounded-xl text-sm font-bold flex justify-center items-center transition-all active:scale-[0.98] ${
            isDone 
              ? "bg-secondary text-foreground border border-border/50 hover:bg-secondary/80" 
              : "bg-foreground text-background shadow-lg shadow-foreground/20 hover:bg-foreground/90"
          }`}
        >
          {isDone ? "Ver receta de nuevo" : "Ver receta completa"}
        </Link>
      </div>
    </div>
  );
}
