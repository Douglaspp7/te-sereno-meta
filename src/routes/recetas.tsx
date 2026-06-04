import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { z } from "zod";
import { AppShell, PageHeader } from "@/components/AppShell";
import { RecipeCard } from "@/components/RecipeCard";
import { CATEGORIES, RECIPES } from "@/data/recipes";

const searchSchema = z.object({ cat: z.string().optional(), q: z.string().optional() });

export const Route = createFileRoute("/recetas")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Recetas de tés — Tés para Bajar de Peso" },
      { name: "description", content: "Explora más de 100 recetas de tés naturales por categoría: metabolismo, detox, digestivos, relajantes y más." },
    ],
  }),
  component: RecetasPage,
});

function RecetasPage() {
  const { cat, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState(q ?? "");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return RECIPES.filter((r) => {
      if (cat && r.category !== cat) return false;
      if (!term) return true;
      return (
        r.name.toLowerCase().includes(term) ||
        r.ingredients.some((i) => i.toLowerCase().includes(term)) ||
        r.benefits.some((b) => b.toLowerCase().includes(term))
      );
    });
  }, [cat, query]);

  return (
    <AppShell>
      <PageHeader title="Recetas" subtitle={`${filtered.length} infusiones para tu bienestar`} />

      <div className="px-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, ingrediente o beneficio…"
            className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-10 text-sm shadow-soft outline-none transition focus:ring-2 focus:ring-primary/30"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => navigate({ search: { q: query || undefined } })}
          className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-medium transition ${
            !cat ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
          }`}
        >
          Todas
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate({ search: { cat: c.id, q: query || undefined } })}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-medium transition ${
              cat === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
            }`}
          >
            <span className="mr-1">{c.emoji}</span>{c.name}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 px-5 sm:grid-cols-2">
        {filtered.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-soft">
            No encontramos recetas. Prueba con otro término.
            <div className="mt-3">
              <Link to="/recetas" className="text-primary font-medium">Ver todas las recetas</Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
