import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
});

type Data = {
  display_name: string;
  sex: string;
  age: string;
  height_cm: string;
  start_weight: string;
  goal_weight: string;
  activity_level: string;
  main_difficulty: string;
  main_goal: string;
};

const empty: Data = {
  display_name: "",
  sex: "",
  age: "",
  height_cm: "",
  start_weight: "",
  goal_weight: "",
  activity_level: "",
  main_difficulty: "",
  main_goal: "",
};

type Step = {
  key: keyof Data;
  title: string;
  input?: "text" | "number";
  placeholder?: string;
  suffix?: string;
  options?: ReadonlyArray<readonly [string, string]>;
};

const steps: ReadonlyArray<Step> = [
  { key: "display_name", title: "¿Cómo te llamas?", input: "text", placeholder: "Tu nombre" },
  { key: "sex", title: "Sexo", options: [["male", "Hombre"], ["female", "Mujer"], ["other", "Otro"]] },
  { key: "age", title: "¿Cuántos años tienes?", input: "number", placeholder: "30", suffix: "años" },
  { key: "height_cm", title: "Tu altura", input: "number", placeholder: "170", suffix: "cm" },
  { key: "start_weight", title: "Tu peso actual", input: "number", placeholder: "75", suffix: "kg" },
  { key: "goal_weight", title: "Tu peso ideal", input: "number", placeholder: "68", suffix: "kg" },
  {
    key: "activity_level",
    title: "Nivel de actividad física",
    options: [
      ["sedentary", "Sedentario"],
      ["light", "Ligero (1-2 días/semana)"],
      ["moderate", "Moderado (3-4 días/semana)"],
      ["active", "Activo (5+ días/semana)"],
    ],
  },
  {
    key: "main_difficulty",
    title: "Tu principal dificultad",
    options: [
      ["anxiety", "Ansiedad"],
      ["sugar", "Azúcar"],
      ["night_eating", "Comer por la noche"],
      ["no_time", "Falta de tiempo"],
      ["sedentary", "Sedentarismo"],
    ],
  },
  {
    key: "main_goal",
    title: "Tu objetivo principal",
    options: [
      ["lose_weight", "Perder peso"],
      ["energy", "Ganar energía"],
      ["habits", "Mejorar hábitos"],
      ["measures", "Reducir medidas"],
    ],
  },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = Route.useRouteContext();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>(empty);
  const [saving, setSaving] = useState(false);

  const total = steps.length;
  const current = steps[step];
  const value = data[current.key];
  const canContinue = value.trim().length > 0;

  const next = async () => {
    if (!canContinue) return;
    if (step < total - 1) {
      setStep(step + 1);
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: data.display_name,
          sex: data.sex,
          age: parseInt(data.age, 10),
          height_cm: parseFloat(data.height_cm),
          start_weight: parseFloat(data.start_weight),
          current_weight: parseFloat(data.start_weight),
          goal_weight: parseFloat(data.goal_weight),
          activity_level: data.activity_level,
          main_difficulty: data.main_difficulty,
          main_goal: data.main_goal,
          onboarding_completed: true,
          plan_started_at: new Date().toISOString(),
          start_date: new Date().toISOString().slice(0, 10),
        })
        .eq("id", user!.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      navigate({ to: "/generando", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const setVal = (v: string) => setData((d) => ({ ...d, [current.key]: v }));

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background px-5 pb-8 pt-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => step > 0 && setStep(step - 1)}
          className={`grid h-9 w-9 place-items-center rounded-full ${step === 0 ? "invisible" : "bg-card shadow-soft"}`}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="text-xs font-medium text-muted-foreground">{step + 1} / {total}</div>
        <div className="w-9" />
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${((step + 1) / total) * 100}%` }}
        />
      </div>

      <div className="mt-12 flex-1">
        <h1 className="font-display text-3xl leading-tight text-foreground">{current.title}</h1>

        <div className="mt-8">
          {current.input ? (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 shadow-soft">
              <input
                type={current.input}
                inputMode={current.input === "number" ? "numeric" : undefined}
                className="w-full bg-transparent text-lg outline-none"
                placeholder={current.placeholder}
                value={value}
                onChange={(e) => setVal(e.target.value)}
                autoFocus
              />
              {current.suffix && <span className="text-sm text-muted-foreground">{current.suffix}</span>}
            </div>
          ) : (
            <div className="space-y-2">
              {current.options!.map(([v, label]) => {
                const active = value === v;
                return (
                  <button
                    key={v}
                    onClick={() => setVal(v)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left text-sm font-medium transition ${
                      active
                        ? "border-primary bg-primary/5 text-foreground shadow-soft"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={next}
        disabled={!canContinue || saving}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-medium text-primary-foreground shadow-soft transition active:scale-[0.98] disabled:opacity-40"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {step === total - 1 ? (
          <>Crear mi plan <Sparkles className="h-4 w-4" /></>
        ) : (
          <>Continuar <ArrowRight className="h-4 w-4" /></>
        )}
      </button>
    </div>
  );
}
