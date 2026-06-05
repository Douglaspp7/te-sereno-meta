import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Camera, Sparkles, Lock } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/analizar")({
  component: AnalizarPage,
});

function AnalizarPage() {
  return (
    <AppShell>
      <header className="px-5 pt-10 pb-2 flex items-center gap-3">
        <Link to="/" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Premium IA</p>
          <h1 className="font-display text-2xl font-bold">Analizar Comida</h1>
        </div>
      </header>

      <section className="px-5 mt-6">
        <div className="rounded-[2rem] bg-foreground text-background p-8 text-center shadow-float">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-background/10">
            <Camera className="h-8 w-8" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-extrabold">Fotografía tu plato</h2>
          <p className="mt-2 text-sm text-background/70">La IA detecta los alimentos y calcula calorías, proteínas, carbohidratos y grasas.</p>

          <button disabled className="mt-6 inline-flex items-center gap-2 rounded-full bg-background/10 px-5 py-3 text-sm font-bold text-background/80">
            <Lock className="h-4 w-4" /> Próximamente
          </button>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-border/50 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-primary">
            <Sparkles className="h-4 w-4" /> Cómo funciona
          </p>
          <ol className="mt-3 space-y-2 text-sm text-foreground">
            <li>1. Toca el botón y abre la cámara.</li>
            <li>2. Fotografía tu plato desde arriba.</li>
            <li>3. Recibe el desglose nutricional al instante.</li>
          </ol>
        </div>
      </section>

      <div className="h-10" />
    </AppShell>
  );
}
