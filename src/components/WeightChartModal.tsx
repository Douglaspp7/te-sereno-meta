import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";
import { Plus, Check } from "lucide-react";

export function WeightChartModal({
  open,
  onClose,
  currentWeight,
  goalWeight,
  startWeight,
  onSaveWeight,
}: {
  open: boolean;
  onClose: () => void;
  currentWeight: number | null;
  goalWeight: number | null;
  startWeight: number | null;
  onSaveWeight: (weight: number) => void;
}) {
  const [newWeight, setNewWeight] = useState(currentWeight?.toString() || "");

  // Mock historical data (in a real app, this comes from a weight_logs table)
  const data = [
    { day: "Día 1", weight: startWeight || 80 },
    { day: "Día 3", weight: (startWeight || 80) - 0.5 },
    { day: "Día 7", weight: (startWeight || 80) - 1.2 },
    { day: "Hoy", weight: currentWeight || 78 },
  ];

  const minWeight = Math.min(...data.map((d) => d.weight), goalWeight || 70) - 2;
  const maxWeight = Math.max(...data.map((d) => d.weight)) + 2;

  const handleSave = () => {
    const val = parseFloat(newWeight);
    if (!isNaN(val)) {
      onSaveWeight(val);
      onClose();
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-[2rem] bg-[#F8FAF8] px-0 flex flex-col gap-0">
        <SheetHeader className="px-6 pt-6 pb-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Tu Progreso</p>
          <SheetTitle className="text-3xl font-extrabold font-display">Diario de Peso</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24">
          
          {/* Chart Section */}
          <div className="h-64 w-full rounded-2xl bg-white p-4 shadow-sm border border-border/50">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dy={10} />
                <YAxis domain={[minWeight, maxWeight]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#4F8A5B', fontWeight: 'bold' }}
                />
                {goalWeight && (
                   <ReferenceLine y={goalWeight} stroke="#F59E0B" strokeDasharray="3 3" label={{ position: 'top', value: 'Meta', fill: '#F59E0B', fontSize: 10, fontWeight: 'bold' }} />
                )}
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#4F8A5B"
                  strokeWidth={4}
                  dot={{ r: 4, fill: "#4F8A5B", strokeWidth: 2, stroke: "#FFF" }}
                  activeDot={{ r: 6, fill: "#4F8A5B", strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Input Section */}
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm border border-border/50">
             <h3 className="font-bold text-lg text-center mb-4">¿Cuánto pesas hoy?</h3>
             <div className="flex items-center justify-center gap-2">
                <input 
                  type="number" 
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-32 rounded-2xl bg-secondary/20 py-4 text-center font-display text-4xl font-extrabold text-primary outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="0.0"
                />
                <span className="text-xl font-bold text-muted-foreground">kg</span>
             </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border/50 bg-white/80 backdrop-blur-md p-4 pb-8">
          <button
            onClick={handleSave}
            className="w-full rounded-[1.5rem] bg-primary py-4 font-bold text-lg text-white shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Check className="h-5 w-5" strokeWidth={3} /> Guardar Peso
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
