import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useState } from "react";
import { ShoppingCart, CheckCircle2, Circle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/compras")({
  component: ComprasPage,
});

type ListItem = { id: string; text: string; category: string };

const LISTS: Record<number, ListItem[]> = {
  1: [
    { id: "1-1", text: "Avena integral (500g)", category: "Despensa" },
    { id: "1-2", text: "Quinoa (500g)", category: "Despensa" },
    { id: "1-3", text: "Aceite de oliva virgen extra", category: "Despensa" },
    { id: "1-4", text: "Pechuga de pollo (1kg)", category: "Proteínas" },
    { id: "1-5", text: "Huevos (1 docena)", category: "Proteínas" },
    { id: "1-6", text: "Salmón fresco (300g)", category: "Proteínas" },
    { id: "1-7", text: "Espinacas frescas", category: "Vegetales" },
    { id: "1-8", text: "Espárragos (1 manojo)", category: "Vegetales" },
    { id: "1-9", text: "Aguacates (3 unidades)", category: "Vegetales" },
    { id: "1-10", text: "Frutos rojos (frescos o congelados)", category: "Frutas" },
    { id: "1-11", text: "Limones (1 kg)", category: "Frutas" },
    { id: "1-12", text: "Leche de almendras (sin azúcar)", category: "Lácteos/Vegetal" },
  ],
  2: [
    { id: "2-1", text: "Arroz integral (1kg)", category: "Despensa" },
    { id: "2-2", text: "Lentejas (500g)", category: "Despensa" },
    { id: "2-3", text: "Atún al natural (3 latas)", category: "Proteínas" },
    { id: "2-4", text: "Pavo molido (500g)", category: "Proteínas" },
    { id: "2-5", text: "Huevos (1 docena)", category: "Proteínas" },
    { id: "2-6", text: "Brócoli (1 cabeza)", category: "Vegetales" },
    { id: "2-7", text: "Zanahorias y Apio", category: "Vegetales" },
    { id: "2-8", text: "Lechuga romana", category: "Vegetales" },
    { id: "2-9", text: "Manzanas verdes", category: "Frutas" },
    { id: "2-10", text: "Yogur griego natural", category: "Lácteos/Vegetal" },
    { id: "2-11", text: "Nueces o almendras (200g)", category: "Snacks" },
  ],
  3: [
    { id: "3-1", text: "Pasta integral o de legumbres", category: "Despensa" },
    { id: "3-2", text: "Garbanzos (2 latas)", category: "Despensa" },
    { id: "3-3", text: "Carne magra de res (500g)", category: "Proteínas" },
    { id: "3-4", text: "Pechuga de pollo (1kg)", category: "Proteínas" },
    { id: "3-5", text: "Tomates cherry (2 cajas)", category: "Vegetales" },
    { id: "3-6", text: "Calabacín (3 unidades)", category: "Vegetales" },
    { id: "3-7", text: "Pimientos variados", category: "Vegetales" },
    { id: "3-8", text: "Plátanos", category: "Frutas" },
    { id: "3-9", text: "Kéfir o Yogur", category: "Lácteos/Vegetal" },
    { id: "3-10", text: "Chocolate negro >70%", category: "Snacks" },
  ]
};

function ComprasPage() {
  const [week, setWeek] = useState<number>(1);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggleCheck = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
  };

  const list = LISTS[week] || [];
  
  // Agrupar por categorias
  const categories = Array.from(new Set(list.map(item => item.category)));
  const progress = list.length === 0 ? 0 : Math.round((list.filter(item => checked.has(item.id)).length / list.length) * 100);

  return (
    <AppShell>
      <PageHeader 
        title="Lista de compras" 
        subtitle="Tu despensa saludable." 
        action={
           <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent shadow-sm">
             <ShoppingCart className="h-5 w-5 text-white" />
           </div>
        }
      />
      
      <div className="px-5 mt-2">
        {/* TABS */}
        <div className="flex w-full rounded-full bg-secondary/30 p-1 mb-6">
          {[1, 2, 3].map((w) => (
            <button
              key={w}
              onClick={() => setWeek(w)}
              className={`flex-1 rounded-full py-2 text-[13px] font-bold transition-all ${
                week === w ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semana {w}
            </button>
          ))}
        </div>

        {/* PROGRESS CARD */}
        <div className="mb-6 rounded-[1.5rem] bg-accent p-5 text-white shadow-float">
           <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">Progreso de la Semana {week}</p>
           <div className="flex items-end justify-between mt-1">
             <p className="font-display text-3xl font-extrabold">{progress}%</p>
             <p className="text-sm font-semibold text-white/80">{list.filter(item => checked.has(item.id)).length} de {list.length}</p>
           </div>
           <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/20">
             <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
           </div>
        </div>

        {/* LIST */}
        <div className="space-y-6 pb-8">
          {categories.map(cat => {
            const items = list.filter(i => i.category === cat);
            return (
              <div key={cat}>
                <h3 className="mb-3 px-1 text-[12px] font-bold uppercase tracking-widest text-muted-foreground">{cat}</h3>
                <div className="space-y-2">
                  {items.map(item => {
                    const isChecked = checked.has(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleCheck(item.id)}
                        className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left shadow-sm transition active:scale-[0.99] ${
                          isChecked ? "border-border/40 bg-background" : "border-border/50 bg-white"
                        }`}
                      >
                        <span className={`transition-colors ${isChecked ? "text-accent" : "text-muted-foreground/30"}`}>
                          {isChecked ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                        </span>
                        <span className={`text-[15px] font-bold transition-all ${isChecked ? "text-muted-foreground line-through opacity-60" : "text-foreground"}`}>
                          {item.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
