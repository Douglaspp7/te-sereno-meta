import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { teas } from "@/data/teas";

export function TeDelDiaCard({ currentDayNum, isDone }: { currentDayNum: number, isDone: boolean }) {
  const tea = teas.find(t => t.day === currentDayNum) || teas[0];

  return (
    <Link
      to="/te"
      className={`w-full text-left p-5 rounded-[1.5rem] border flex items-center gap-4 transition-all block mb-4 ${
        isDone 
          ? "bg-muted border-border/50 opacity-80" 
          : "bg-emerald-50 border-emerald-100 shadow-sm hover:shadow-md active:scale-[0.98]"
      }`}
    >
      <div className={`h-12 w-12 rounded-2xl grid place-items-center shrink-0 ${isDone ? "bg-secondary text-muted-foreground" : "bg-emerald-100 text-emerald-600"}`}>
        <span className="text-2xl">🍵</span>
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-0.5">Té del Día</p>
        <p className={`text-sm font-bold leading-tight ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
          {tea.name}
        </p>
      </div>
      <div className={`h-6 w-6 rounded-full border-2 grid place-items-center transition-colors ${isDone ? "bg-primary border-primary text-white" : "border-muted-foreground/30 bg-background"}`}>
        {isDone && <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={3} />}
      </div>
    </Link>
  );
}
