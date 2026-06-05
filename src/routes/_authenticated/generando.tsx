import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/generando")({
  component: GeneratingPage,
});

const tasks = [
  "Analizando tu perfil",
  "Calculando tus objetivos",
  "Generando tu alimentación",
  "Creando tus ejercicios",
  "Personalizando los desafíos",
  "Preparando tu reto de 21 días",
];

function GeneratingPage() {
  const navigate = useNavigate();
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (done >= tasks.length) {
      const t = setTimeout(() => navigate({ to: "/", replace: true }), 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDone((d) => d + 1), 900);
    return () => clearTimeout(t);
  }, [done, navigate]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center bg-background px-6 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-3xl bg-primary/10 text-primary shadow-soft">
        <Sparkles className="h-10 w-10 animate-pulse" />
      </div>
      <h1 className="mt-8 font-display text-3xl text-foreground">Creando tu plan personalizado…</h1>
      <p className="mt-2 text-sm text-muted-foreground">La IA está diseñando tu reto de 21 días.</p>

      <ul className="mt-10 w-full space-y-3 text-left">
        {tasks.map((t, i) => {
          const isDone = i < done;
          const isCurrent = i === done;
          return (
            <li
              key={t}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                isDone
                  ? "border-primary/30 bg-primary/5 text-foreground"
                  : isCurrent
                  ? "border-border bg-card text-foreground shadow-soft"
                  : "border-border bg-card/50 text-muted-foreground"
              }`}
            >
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                  isDone
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : isCurrent ? (
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                ) : null}
              </span>
              {t}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
