import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useState, useMemo, useEffect } from "react";
import { ShoppingCart, CheckCircle2, Circle, ChevronDown, ChevronUp, Download, Camera, Info, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { parseIngredients, ParsedIngredient } from "@/lib/ingredientParser";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/_authenticated/compras")({
  component: ComprasPage,
});

function ComprasPage() {
  const [week, setWeek] = useState<number>(1);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [yaTengo, setYaTengo] = useState<Set<string>>(new Set());
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<ParsedIngredient | null>(null);

  // Load "Ya tengo" from local storage
  useEffect(() => {
    const saved = localStorage.getItem("compras_ya_tengo");
    if (saved) {
      setYaTengo(new Set(JSON.parse(saved)));
    }
  }, []);

  const toggleYaTengo = (name: string) => {
    const next = new Set(yaTengo);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setYaTengo(next);
    localStorage.setItem("compras_ya_tengo", JSON.stringify(Array.from(next)));
    
    // Auto-check the item if marking as ya tengo
    if (!next.has(name) && checked.has(name)) {
       // do nothing
    } else if (next.has(name)) {
       const nextChecked = new Set(checked);
       nextChecked.add(name);
       setChecked(nextChecked);
    }
  };

  // Fetch meals for the week
  const { data: daysData, isLoading } = useQuery({
    queryKey: ["week_meals", week],
    queryFn: async () => {
      const startDay = (week - 1) * 7 + 1;
      const endDay = week * 7;
      
      const { data, error } = await supabase
        .from("days")
        .select(`
          day_number,
          breakfast:recipes!days_breakfast_recipe_id_fkey(name, ingredients),
          lunch:recipes!days_lunch_recipe_id_fkey(name, ingredients),
          dinner:recipes!days_dinner_recipe_id_fkey(name, ingredients)
        `)
        .gte("day_number", startDay)
        .lte("day_number", endDay);

      if (error && error.code !== "PGRST116") throw error;
      return data || [];
    }
  });

  const parsedIngredients = useMemo(() => {
    if (!daysData) return [];
    return parseIngredients(daysData);
  }, [daysData]);

  // Categories and filtering
  const categories = useMemo(() => Array.from(new Set(parsedIngredients.map(i => i.category))), [parsedIngredients]);
  
  // Calculate progress (exclude "Ya tengo" from the "to buy" denominator, or count them as checked)
  const totalItems = parsedIngredients.length;
  const checkedItems = parsedIngredients.filter(item => checked.has(item.name) || yaTengo.has(item.name)).length;
  const progress = totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100);

  const toggleCheck = (name: string) => {
    const next = new Set(checked);
    if (next.has(name)) next.delete(name);
    else {
      next.add(name);
      // Check if 100%
      if (next.size + yaTengo.size >= totalItems) {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#34d399', '#10b981', '#ffffff'] });
      }
    }
    setChecked(next);
  };

  const handlePrint = () => {
    window.print();
  };

  // Focus Mode UI
  if (isFocusMode) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 p-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-black">Modo Supermercado</h1>
            <p className="text-sm font-bold text-muted-foreground">{checkedItems} de {totalItems} listos</p>
          </div>
          <button 
            onClick={() => setIsFocusMode(false)}
            className="px-4 py-2 bg-secondary text-foreground font-bold rounded-full text-sm"
          >
            Salir
          </button>
        </div>
        
        <div className="px-5 mt-6 space-y-6">
          {categories.map(cat => {
            const items = parsedIngredients.filter(i => i.category === cat);
            const allChecked = items.every(i => checked.has(i.name) || yaTengo.has(i.name));
            if (allChecked) return null; // Hide fully checked categories in focus mode
            
            return (
              <div key={cat} className="space-y-2">
                <h3 className="mb-3 px-1 text-[13px] font-bold uppercase tracking-widest text-primary">{cat}</h3>
                {items.map(item => {
                  const isChecked = checked.has(item.name) || yaTengo.has(item.name);
                  if (isChecked) return null;
                  return (
                    <button
                      key={item.name}
                      onClick={() => toggleCheck(item.name)}
                      className="flex w-full items-center gap-4 rounded-2xl border border-border/50 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
                    >
                      <span className="text-muted-foreground/30"><Circle className="h-6 w-6" /></span>
                      <div className="flex-1">
                        <span className="text-[16px] font-bold text-foreground">{item.name}</span>
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.original}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <PageHeader 
        title="Compras" 
        subtitle="Todo para tu éxito." 
        action={
           <button onClick={handlePrint} className="grid h-10 w-10 place-items-center rounded-xl bg-accent shadow-sm hover:scale-105 transition-transform">
             <Download className="h-5 w-5 text-white" />
           </button>
        }
      />
      
      <div className="px-5 mt-2 print:mt-0 print:px-0">
        {/* TABS (Hidden in print) */}
        <div className="flex w-full rounded-full bg-secondary/30 p-1 mb-6 print:hidden">
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

        {/* TOP CARD */}
        <div className="mb-6 rounded-[1.5rem] bg-accent p-6 text-white shadow-float print:hidden">
           <div className="flex justify-between items-start mb-4">
             <div>
               <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">Resumen</p>
               <h2 className="font-display text-2xl font-extrabold mt-1">Semana {week}</h2>
             </div>
             <div className="text-right">
               <p className="text-sm font-semibold text-white/90">21 comidas</p>
               <p className="text-sm font-semibold text-white/90">{totalItems} ingredientes</p>
             </div>
           </div>
           
           <div className="flex items-end justify-between mt-4">
             <p className="font-display text-3xl font-extrabold">{progress}% <span className="text-sm font-bold text-white/70 tracking-normal">comprado</span></p>
           </div>
           <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
             <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
           </div>

           <button 
             onClick={() => setIsFocusMode(true)}
             disabled={totalItems === 0 || progress === 100}
             className="mt-6 w-full py-3.5 bg-white text-accent font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50"
           >
             <ShoppingCart className="h-5 w-5" /> Empezar compras
           </button>
        </div>

        {/* SMART BUY CARD */}
        {parsedIngredients.length > 0 && (
          <div className="mb-8 rounded-[1.5rem] bg-amber-50 border border-amber-100 p-5 print:hidden">
            <h3 className="font-bold text-amber-900 flex items-center gap-2 mb-3">
              <span className="text-lg">💰</span> Compra Inteligente
            </h3>
            <p className="text-xs text-amber-800 font-medium mb-3">Ingredientes más utilizados esta semana:</p>
            <div className="flex flex-wrap gap-2">
              {parsedIngredients
                .sort((a, b) => b.mealsUsedIn.length - a.mealsUsedIn.length)
                .slice(0, 5)
                .map(item => (
                  <div key={item.name} className="px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-bold text-amber-900 flex items-center gap-1.5 shadow-sm">
                    {item.name} <span className="text-amber-500">x{item.mealsUsedIn.length}</span>
                  </div>
              ))}
            </div>
          </div>
        )}

        {/* LIST */}
        <div className="space-y-6 pb-8">
          {isLoading ? (
             <div className="space-y-4">
               <div className="h-12 bg-secondary/50 rounded-2xl animate-pulse" />
               <div className="h-12 bg-secondary/50 rounded-2xl animate-pulse" />
             </div>
          ) : parsedIngredients.length === 0 ? (
             <div className="text-center py-10 opacity-50">
               <ShoppingCart className="h-12 w-12 mx-auto mb-3" />
               <p className="font-bold">No hay ingredientes para esta semana.</p>
             </div>
          ) : (
            categories.map(cat => {
              const items = parsedIngredients.filter(i => i.category === cat);
              return (
                <div key={cat} className="print:break-inside-avoid">
                  <h3 className="mb-3 px-1 text-[13px] font-bold uppercase tracking-widest text-primary border-b border-border/50 pb-2">{cat}</h3>
                  <div className="space-y-2">
                    {items.map(item => {
                      const isChecked = checked.has(item.name);
                      const isYaTengo = yaTengo.has(item.name);
                      const visuallyChecked = isChecked || isYaTengo;

                      return (
                        <div key={item.name} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left shadow-sm transition-all ${visuallyChecked ? "border-border/40 bg-background" : "border-border/50 bg-white"}`}>
                          <button onClick={() => toggleCheck(item.name)} className={`shrink-0 transition-colors ${visuallyChecked ? "text-accent" : "text-muted-foreground/30 hover:text-accent/50"}`}>
                            {visuallyChecked ? <CheckCircle2 className="h-7 w-7" /> : <Circle className="h-7 w-7" />}
                          </button>
                          
                          <div className="flex-1 min-w-0" onClick={() => setSelectedIngredient(item)}>
                            <span className={`text-[15px] font-bold transition-all block truncate ${visuallyChecked ? "text-muted-foreground line-through opacity-60" : "text-foreground"}`}>
                              {item.name}
                            </span>
                            <p className={`text-[11px] truncate mt-0.5 ${visuallyChecked ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
                              {item.original}
                            </p>
                          </div>

                          <button onClick={() => setSelectedIngredient(item)} className="p-2 text-muted-foreground/50 hover:text-primary transition-colors">
                            <Info className="h-5 w-5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FUTURE: SCANNER PLACEHOLDER */}
        <div className="mb-10 rounded-[1.5rem] bg-secondary/30 border border-border border-dashed p-6 text-center print:hidden">
          <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-muted-foreground">
            <Camera className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-foreground mb-1">Escanear Producto</h4>
          <p className="text-xs text-muted-foreground font-medium mb-4 px-4">Próximamente: Usa la IA para saber si un producto es compatible con tu reto.</p>
          <button className="px-5 py-2 bg-white border border-border/50 rounded-xl text-xs font-bold text-muted-foreground cursor-not-allowed opacity-70">
            En desarrollo
          </button>
        </div>
      </div>

      {/* INGREDIENT DETAIL MODAL */}
      {selectedIngredient && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background w-full max-w-md rounded-[2rem] p-6 shadow-2xl relative animate-in slide-in-from-bottom-8 duration-300">
            <button onClick={() => setSelectedIngredient(null)} className="absolute top-4 right-4 p-2 bg-secondary rounded-full text-muted-foreground hover:text-foreground">
              <ChevronDown className="h-5 w-5" />
            </button>
            
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full mb-3 inline-block">
              {selectedIngredient.category}
            </span>
            <h2 className="font-display text-2xl font-black text-foreground mb-1">{selectedIngredient.name}</h2>
            <p className="text-sm font-medium text-muted-foreground mb-6 line-clamp-3">{selectedIngredient.original}</p>

            <div className="bg-secondary/40 rounded-2xl p-4 mb-6">
              <h4 className="font-bold text-sm text-foreground mb-3">Utilizado en:</h4>
              <ul className="space-y-2">
                {selectedIngredient.mealsUsedIn.map((meal, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-primary font-bold mt-0.5">✓</span>
                    <div>
                      <span className="font-bold text-foreground">Día {meal.day} {meal.mealName}</span>
                      <p className="text-xs text-muted-foreground">{meal.recipeName}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <button 
              onClick={() => toggleYaTengo(selectedIngredient.name)}
              className={`w-full py-4 rounded-[1.5rem] font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                yaTengo.has(selectedIngredient.name) 
                  ? "bg-rose-100 text-rose-600 border border-rose-200"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              <Heart className={`h-5 w-5 ${yaTengo.has(selectedIngredient.name) ? "fill-current" : ""}`} /> 
              {yaTengo.has(selectedIngredient.name) ? "Ya tengo este producto" : "Marcar que ya lo tengo"}
            </button>
          </div>
        </div>
      )}

      {/* CONFETTI OVERLAY CHECK */}
      {progress === 100 && totalItems > 0 && (
        <div className="fixed inset-x-4 bottom-24 z-50 bg-primary text-white p-4 rounded-2xl shadow-xl shadow-primary/30 flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in print:hidden">
          <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <span className="text-xl">🎉</span>
          </div>
          <div>
            <h4 className="font-bold text-sm">¡Compra completada!</h4>
            <p className="text-xs font-medium text-white/80">Ya tienes todo lo necesario para tu semana.</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
