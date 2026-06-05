import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { programDays } from "@/lib/content/days";

export const Route = createFileRoute("/_authenticated/recetas")({
  component: RecetasPage,
});

function RecetasPage() {
  const days = Object.values(programDays);
  return (
    <AppShell>
      <header className="px-5 pt-10 pb-2 flex items-center gap-3">
        <Link to="/" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Biblioteca</p>
          <h1 className="font-display text-2xl font-bold">Recetas</h1>
        </div>
      </header>

      <section className="px-5 mt-4 space-y-3">
        {days.map((d) => (
          <div key={d.dayNumber} className="rounded-[1.5rem] border border-border/50 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Día {d.dayNumber}</p>
            <div className="mt-2 space-y-2">
              {[d.breakfast, d.lunch, d.dinner].map((r) => (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/15 text-primary">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold uppercase text-muted-foreground">{r.label}</p>
                    <p className="text-[14px] font-semibold text-foreground truncate">{r.name}</p>
                  </div>
                  <span className="text-[11px] font-bold text-primary">{r.kcal} kcal</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <div className="h-10" />
    </AppShell>
  );
}
