import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Sparkles, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/generando")({
  component: GeneratingPage,
});

const tasks = [
  "Preparando tu entorno",
  "Descargando videos de ejercicios",
  "Organizando tus recetas",
  "Configurando tus misiones",
  "Estructurando las 3 semanas",
  "Liberando tu reto de 21 días",
];

function GeneratingPage() {
  const navigate = useNavigate();
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (done >= tasks.length) {
      const t = setTimeout(() => navigate({ to: "/", replace: true }), 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDone((d) => d + 1), 850);
    return () => clearTimeout(t);
  }, [done, navigate]);

  const pct = Math.round((done / tasks.length) * 100);

  return (
    <div className="gradient-hero relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="relative">
        <div className="absolute inset-0 -m-6 animate-pulse rounded-full bg-primary/20 blur-2xl" />
        <div className="relative grid h-24 w-24 place-items-center rounded-full gradient-ai shadow-float animate-float">
          <Sparkles className="h-10 w-10 text-white" strokeWidth={2} />
        </div>
      </div>

      <h1 className="mt-10 font-display text-[28px] leading-tight text-foreground">
        Preparando tu plan<br />estructurado…
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Estamos organizando tu reto de 21 días</p>

      <div className="mt-6 w-full">
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <span className="text-muted-foreground">Procesando</span>
          <span className="text-primary">{pct}%</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full gradient-ai transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <ul className="mt-8 w-full space-y-2.5 text-left">
        {tasks.map((t, i) => {
          const isDone = i < done;
          const isCurrent = i === done;
          return (
            <li
              key={t}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all ${
                isDone
                  ? "bg-card text-foreground shadow-soft"
                  : isCurrent
                  ? "bg-card text-foreground shadow-float scale-[1.02]"
                  : "bg-card/40 text-muted-foreground"
              }`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                  isDone
                    ? "gradient-ai text-white"
                    : isCurrent
                    ? "bg-accent text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : isCurrent ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : null}
              </span>
              <span className={isCurrent ? "font-semibold" : isDone ? "font-medium" : ""}>{t}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
