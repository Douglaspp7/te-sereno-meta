import { Link } from "@tanstack/react-router";
import { Clock, Heart } from "lucide-react";
import type { Recipe } from "@/data/recipes";
import { getCategory } from "@/data/recipes";
import { useStore } from "@/lib/store";
import teaImg from "@/assets/tea-generic.jpg";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const cat = getCategory(recipe.category);
  const [favs, setFavs] = useStore<string[]>("favorites", []);
  const isFav = favs.includes(recipe.id);

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    setFavs((prev) => (prev.includes(recipe.id) ? prev.filter((x) => x !== recipe.id) : [...prev, recipe.id]));
  };

  return (
    <Link
      to="/recetas/$id"
      params={{ id: recipe.id }}
      className="group relative block overflow-hidden rounded-3xl bg-card shadow-soft transition hover:shadow-float"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={teaImg}
          alt={recipe.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
        <span
          className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur"
        >
          <span>{cat?.emoji}</span> {cat?.name}
        </span>
        <button
          onClick={toggleFav}
          aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 backdrop-blur transition hover:scale-110"
        >
          <Heart
            className={`h-4 w-4 ${isFav ? "fill-destructive text-destructive" : "text-foreground"}`}
          />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg leading-tight text-foreground line-clamp-2">{recipe.name}</h3>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {recipe.time}
          </span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
            {recipe.difficulty}
          </span>
        </div>
      </div>
    </Link>
  );
}
