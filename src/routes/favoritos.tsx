import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { RecipeCard } from "@/components/RecipeCard";
import { RECIPES } from "@/data/recipes";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/favoritos")({
  head: () => ({ meta: [{ title: "Favoritos — Tés para Bajar de Peso" }] }),
  component: Favoritos,
});

function Favoritos() {
  const [favs] = useStore<string[]>("favorites", []);
  const list = RECIPES.filter((r) => favs.includes(r.id));

  return (
    <AppShell>
      <PageHeader title="Favoritos" subtitle={`${list.length} recetas guardadas`} />
      {list.length === 0 ? (
        <div className="mx-5 rounded-3xl bg-card p-10 text-center shadow-soft">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Aún no tienes recetas favoritas. Explora y guarda tus preferidas con el corazón.
          </p>
          <Link to="/recetas" className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
            Explorar recetas
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 px-5 sm:grid-cols-2">
          {list.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}
    </AppShell>
  );
}
