import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Heart, AlertTriangle, Check, Sparkles } from "lucide-react";
import { getRecipe, getCategory, type Recipe } from "@/data/recipes";
import { useStore, today, type DayLog } from "@/lib/store";
import teaImg from "@/assets/tea-generic.jpg";

export const Route = createFileRoute("/recetas/$id")({
  loader: ({ params }) => {
    const recipe = getRecipe(params.id);
    if (!recipe) throw notFound();
    return { recipe };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.recipe.name} — Tés para Bajar de Peso` },
          { name: "description", content: loaderData.recipe.benefits.join(". ") },
        ]
      : [],
  }),
  errorComponent: ({ error }) => <div className="p-8 text-center text-sm">Error: {error.message}</div>,
  notFoundComponent: () => (
    <div className="p-8 text-center">
      <p className="text-sm text-muted-foreground">Receta no encontrada.</p>
      <Link to="/recetas" className="mt-3 inline-block text-primary">Volver a recetas</Link>
    </div>
  ),
  component: RecipeDetail,
});

function RecipeDetail() {
  const { recipe } = Route.useLoaderData() as { recipe: Recipe };
  const cat = getCategory(recipe.category);
  const [favs, setFavs] = useStore<string[]>("favorites", []);
  const [logs, setLogs] = useStore<DayLog[]>("logs", []);
  const [points, setPoints] = useStore<number>("points", 0);

  const isFav = favs.includes(recipe.id);
  const todayDate = today();
  const todayLog = logs.find((l) => l.date === todayDate);
  const consumed = todayLog?.recipes.includes(recipe.id) ?? false;

  const toggleFav = () =>
    setFavs((p) => (p.includes(recipe.id) ? p.filter((x) => x !== recipe.id) : [...p, recipe.id]));

  const markConsumed = () => {
    if (consumed) return;
    setLogs((prev) => {
      const others = prev.filter((l) => l.date !== todayDate);
      const updated = todayLog
        ? { ...todayLog, recipes: [...todayLog.recipes, recipe.id] }
        : { date: todayDate, recipes: [recipe.id] };
      return [...others, updated];
    });
    setPoints((p) => p + 10);
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-28">
      <div className="relative">
        <img src={teaImg} alt={recipe.name} loading="eager" className="h-72 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <Link
          to="/recetas"
          className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-background/90 shadow-soft backdrop-blur"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <button
          onClick={toggleFav}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-background/90 shadow-soft backdrop-blur"
        >
          <Heart className={`h-5 w-5 ${isFav ? "fill-destructive text-destructive" : ""}`} />
        </button>
      </div>

      <div className="-mt-10 relative px-5">
        <div className="rounded-3xl bg-card p-5 shadow-float">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-foreground">
            {cat?.emoji} {cat?.name}
          </span>
          <h1 className="mt-3 font-display text-2xl leading-tight text-foreground">{recipe.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
              <Clock className="h-3 w-3" /> {recipe.time}
            </span>
            <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">{recipe.difficulty}</span>
            <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">{recipe.schedule}</span>
          </div>
        </div>
      </div>

      <Section title="Ingredientes">
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex gap-3 text-sm text-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {ing}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Modo de preparación">
        <ol className="space-y-3">
          {recipe.preparation.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-foreground">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Beneficios">
        <div className="grid gap-2">
          {recipe.benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-2 rounded-2xl bg-secondary/60 p-3 text-sm">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {b}
            </div>
          ))}
        </div>
      </Section>

      {recipe.warning && (
        <div className="mx-5 mt-2 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-foreground">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold text-destructive">Advertencia</p>
            <p className="mt-0.5 text-muted-foreground">{recipe.warning}</p>
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-border bg-background/90 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] backdrop-blur-xl">
        <button
          onClick={markConsumed}
          disabled={consumed}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-full font-medium transition ${
            consumed
              ? "bg-secondary text-secondary-foreground"
              : "bg-primary text-primary-foreground shadow-soft active:scale-[0.98]"
          }`}
        >
          {consumed ? <><Check className="h-4 w-4" /> Tomado hoy (+10 pts)</> : "Marcar como consumido"}
        </button>
        {points > 0 && <p className="mt-2 text-center text-xs text-muted-foreground">Tienes {points} puntos acumulados ✨</p>}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 px-5">
      <h2 className="mb-3 font-display text-lg text-foreground">{title}</h2>
      {children}
    </section>
  );
}
