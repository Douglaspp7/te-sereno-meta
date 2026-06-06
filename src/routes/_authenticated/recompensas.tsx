import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { 
  Lock, Gift, Trophy, Utensils, Flame, ShoppingCart, 
  Dumbbell, Sparkles, Award, Droplet, CheckCircle2,
  Download, ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/lib/auth";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const Route = createFileRoute("/_authenticated/recompensas")({
  component: RecompensasPage,
});

const REWARDS = [
  { id: 1, name: "10 Recetas Express", condition: "7 días consecutivos", icon: Utensils, type: "streak", target: 7, unlockMsg: "Mantén tu racha 7 días para desbloquear 10 Recetas Express.", pdfUrl: "/pdfs/10 Receitas Express.pdf" },
  { id: 2, name: "Postres Saludables", condition: "14 días consecutivos", icon: Flame, type: "streak", target: 14, unlockMsg: "Mantén tu racha 14 días para desbloquear Postres Saludables.", pdfUrl: "/pdfs/Postres-Saludables.pdf" },
  { id: 3, name: "Guía de Compras Inteligentes", condition: "10 comidas preparadas", icon: ShoppingCart, type: "meals", target: 10, unlockMsg: "Prepara 10 comidas para desbloquear Guía de Compras.", pdfUrl: "/pdfs/Guia-de-Compras.pdf" },
  { id: 4, name: "Menú de Emergencia", condition: "5 ejercicios realizados", icon: Dumbbell, type: "exercises", target: 5, unlockMsg: "Realiza 5 ejercicios para desbloquear Menú de Emergencia.", pdfUrl: "/pdfs/Menu de Emergencia.pdf" },
  { id: 5, name: "21 Recetas Premium Extra", condition: "50% del desafío", icon: Sparkles, type: "plan", target: 50, unlockMsg: "Alcanza 50% del plan para desbloquear 21 Recetas Premium.", pdfUrl: "/pdfs/21 Receitas Premium.pdf" },
  { id: 7, name: "Maestro del Té", condition: "14 tés consumidos", icon: Droplet, type: "teas", target: 14, unlockMsg: "Consume té 14 días para desbloquear Maestro del Té." },
  { id: 6, name: "Certificado Oficial MiReto21", condition: "Concluir Día 21", icon: Award, type: "plan", target: 100, unlockMsg: "Completa el Día 21 para desbloquear Certificado Oficial.", isCertificate: true },
  { id: 8, name: "Campeón MiReto21", condition: "100% del programa", icon: Trophy, type: "plan", target: 100, unlockMsg: "Completa el 100% del programa para ser Campeón MiReto21.", isCertificate: true },
];

function RecompensasPage() {
  const { user } = useUser();
  const [selectedReward, setSelectedReward] = useState<any | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: allProgress } = useQuery({
    queryKey: ["all_daily_progress", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("daily_progress")
        .select("*")
        .eq("user_id", user?.id || "")
        .order("day_number", { ascending: true });
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Calculate Metrics
  const metrics = useMemo(() => {
    let currentStreak = 0;
    let maxStreak = 0;
    let totalMeals = 0;
    let totalExercises = 0;
    let totalTeas = 0;
    let planPct = 0;

    if (allProgress) {
      let prevDay = 0;
      for (const p of allProgress) {
        // Count meals
        totalMeals += (p.breakfast_done ? 1 : 0) + (p.lunch_done ? 1 : 0) + (p.dinner_done ? 1 : 0);
        
        // Count exercises
        if (p.exercise_done) totalExercises++;
        
        // Count teas
        if ((p.water_glasses || 0) > 0) totalTeas++;

        // Calculate Streak
        if (p.mission_done || p.exercise_done || p.breakfast_done || p.lunch_done || p.dinner_done || (p.water_glasses || 0) > 0) {
          if (p.day_number === prevDay + 1 || prevDay === 0) {
            currentStreak++;
          } else {
            currentStreak = 1;
          }
          prevDay = p.day_number;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
          currentStreak = 0;
        }
      }
    }

    if (profile?.plan_started_at) {
      const start = new Date(profile.plan_started_at);
      const today = new Date();
      const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const currentDay = Math.min(21, Math.max(1, diff + 1));
      planPct = Math.min(100, Math.round((currentDay / 21) * 100));
    }

    return { streak: maxStreak, meals: totalMeals, exercises: totalExercises, teas: totalTeas, plan: planPct };
  }, [allProgress, profile]);

  const evaluateReward = (reward: any) => {
    let current = 0;
    if (reward.type === "streak") current = metrics.streak;
    if (reward.type === "meals") current = metrics.meals;
    if (reward.type === "exercises") current = metrics.exercises;
    if (reward.type === "teas") current = metrics.teas;
    if (reward.type === "plan") current = metrics.plan;

    const isUnlocked = current >= reward.target;
    let remainingText = "";
    if (!isUnlocked) {
      const remaining = reward.target - current;
      if (reward.type === "streak") remainingText = `Mantén tu racha ${remaining} días más.`;
      if (reward.type === "meals") remainingText = `Prepara ${remaining} comidas más.`;
      if (reward.type === "exercises") remainingText = `Realiza ${remaining} ejercicios más.`;
      if (reward.type === "teas") remainingText = `Toma té ${remaining} días más.`;
      if (reward.type === "plan") remainingText = `Avanza ${remaining}% más en tu plan.`;
    }

    return { ...reward, current, isUnlocked, remainingText };
  };

  const processedRewards = REWARDS.map(evaluateReward);
  const unlockedRewards = processedRewards.filter(r => r.isUnlocked);
  const lockedRewards = processedRewards.filter(r => !r.isUnlocked);

  // Gamification Level
  const totalTasks = (allProgress?.length || 0) * 5; // roughly 5 actions per day
  const maxTasks = 21 * 5; // 105
  const globalPct = Math.round((totalTasks / maxTasks) * 100);
  
  let levelName = "Iniciante";
  let levelColor = "text-slate-500 bg-slate-100";
  let levelProgress = globalPct;
  if (globalPct > 20) { levelName = "Constante"; levelColor = "text-blue-500 bg-blue-100"; }
  if (globalPct > 40) { levelName = "Comprometido"; levelColor = "text-indigo-500 bg-indigo-100"; }
  if (globalPct > 60) { levelName = "Transformación"; levelColor = "text-purple-500 bg-purple-100"; }
  if (globalPct >= 100) { levelName = "Campeón MiReto21"; levelColor = "text-yellow-600 bg-yellow-100"; }

  const handleOpenReward = (reward: any) => {
    if (!reward.isUnlocked) return;
    setSelectedReward(reward);
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#34d399', '#10b981', '#ffffff', '#fbbf24'] });
  };

  const generatePDF = async () => {
    if (!certificateRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(certificateRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save("Certificado_MiReto21.pdf");
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Recompensas" subtitle="Desbloquea premios exclusivos" />

      <div className="px-5 mt-2 space-y-8 pb-24">
        
        {/* Nivel de Usuario */}
        <div className="bg-white rounded-[2rem] border border-border/50 p-6 shadow-sm relative overflow-hidden flex items-center justify-between">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0" />
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Nivel MiReto21</p>
            <h2 className="font-display text-2xl font-black text-foreground">{levelName}</h2>
          </div>
          <div className={`h-16 w-16 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-md relative z-10 ${levelColor}`}>
             <Trophy className="h-8 w-8" />
          </div>
        </div>

        {/* Próximas Recompensas */}
        {lockedRewards.length > 0 && (
          <section>
            <h3 className="font-display text-xl font-bold text-foreground mb-4">Próximas recompensas</h3>
            <div className="space-y-4">
              {lockedRewards.slice(0, 3).map(reward => (
                <div key={reward.id} className="bg-white rounded-[1.5rem] border border-border/50 p-5 shadow-sm opacity-90 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Lock className="h-16 w-16" />
                  </div>
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 grid place-items-center shrink-0">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{reward.condition}</p>
                      <h4 className="font-display text-lg font-bold text-foreground leading-tight mb-2">{reward.name}</h4>
                      
                      {/* Mini Progress Bar */}
                      <div className="w-full bg-secondary rounded-full h-2 mb-2">
                         <div 
                           className="bg-primary h-2 rounded-full transition-all" 
                           style={{ width: `${Math.min(100, (reward.current / reward.target) * 100)}%` }}
                         />
                      </div>
                      
                      <p className="text-sm font-medium text-muted-foreground">{reward.remainingText}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tus Recompensas */}
        <section>
          <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            🎁 Tus recompensas 
            <span className="bg-primary/10 text-primary text-sm px-2 py-0.5 rounded-full">{unlockedRewards.length}</span>
          </h3>
          
          {unlockedRewards.length === 0 ? (
            <div className="bg-white rounded-[1.5rem] border border-border/50 border-dashed p-8 text-center text-muted-foreground shadow-sm">
              <Gift className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Sigue avanzando para desbloquear tu primer premio.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {unlockedRewards.map(reward => {
                const Icon = reward.icon;
                return (
                  <button 
                    key={reward.id} 
                    onClick={() => handleOpenReward(reward)}
                    className="bg-white rounded-[1.5rem] border-2 border-primary/20 p-5 shadow-md shadow-primary/5 flex flex-col items-center justify-center text-center active:scale-95 transition-all group"
                  >
                    <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-primary to-green-400 text-white grid place-items-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                      <Icon className="h-7 w-7" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Disponible</p>
                    <h4 className="font-display font-bold text-foreground leading-snug">{reward.name}</h4>
                  </button>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* Modal Recompensa */}
      {selectedReward && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-5 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-primary to-emerald-500 h-40 flex items-center justify-center relative">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=600')] bg-cover mix-blend-overlay opacity-30" />
               <Gift className="h-20 w-20 text-white drop-shadow-xl animate-bounce" />
            </div>
            
            <div className="p-8 text-center relative -mt-6 bg-white rounded-t-[2rem]">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full mb-4">
                <CheckCircle2 className="h-4 w-4" /> ¡Desbloqueada!
              </div>
              <h2 className="font-display text-2xl font-black text-foreground leading-tight mb-2">
                {selectedReward.name}
              </h2>
              <p className="text-muted-foreground text-sm font-medium mb-8">
                ¡Felicidades! Has completado "{selectedReward.condition}" y ganaste este premio.
              </p>
              
              {selectedReward.isCertificate ? (
                 <button 
                   onClick={generatePDF}
                   disabled={isGeneratingPdf}
                   className="w-full bg-foreground text-background font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl disabled:opacity-70"
                 >
                   <Download className="h-5 w-5" /> {isGeneratingPdf ? "Generando..." : "Descargar Certificado"}
                 </button>
              ) : selectedReward.pdfUrl ? (
                <a 
                  href={selectedReward.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-primary/30"
                >
                  <ArrowRight className="h-5 w-5" /> Abrir Documento
                </a>
              ) : (
                <button 
                  onClick={() => alert("Tu recompensa será descargada aquí pronto.")}
                  className="w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-primary/30"
                >
                  <ArrowRight className="h-5 w-5" /> Acceder al Contenido
                </button>
              )}
              
              <button 
                onClick={() => setSelectedReward(null)}
                className="w-full text-muted-foreground font-bold py-4 mt-2"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Certificate HTML for PDF generation */}
      <div className="absolute -left-[9999px] top-0">
        <div ref={certificateRef} className="w-[800px] h-[600px] bg-white border-[20px] border-primary p-12 text-center flex flex-col justify-center items-center relative">
           <div className="absolute inset-0 border-[10px] border-white z-10 pointer-events-none" />
           <div className="absolute inset-0 border-[4px] border-emerald-100 m-8 z-10 pointer-events-none" />
           
           <Trophy className="h-24 w-24 text-primary mb-6" />
           <h1 className="text-5xl font-display font-black text-slate-800 tracking-tight uppercase mb-2">Certificado de Excelencia</h1>
           <p className="text-xl text-slate-500 font-medium mb-8 uppercase tracking-widest">Este documento certifica que</p>
           
           <h2 className="text-6xl font-display font-bold text-emerald-600 mb-8 border-b-2 border-emerald-200 pb-4 w-3/4">
             {profile?.display_name || "Usuario Ejemplar"}
           </h2>
           
           <p className="text-2xl text-slate-600 leading-relaxed font-medium mb-12 max-w-2xl">
             Ha completado exitosamente los 21 días de transformación del programa <strong className="text-slate-800">MiReto21</strong>, demostrando compromiso, constancia y dedicación hacia un estilo de vida más saludable.
           </p>
           
           <div className="flex justify-between w-full px-16 mt-auto">
              <div className="text-center border-t-2 border-slate-300 pt-4 w-48">
                 <p className="font-bold text-slate-800">MiReto21</p>
                 <p className="text-sm text-slate-500 uppercase">Organización</p>
              </div>
              <div className="text-center border-t-2 border-slate-300 pt-4 w-48">
                 <p className="font-bold text-slate-800">{new Date().toLocaleDateString('es-ES')}</p>
                 <p className="text-sm text-slate-500 uppercase">Fecha de Emisión</p>
              </div>
           </div>
        </div>
      </div>
    </AppShell>
  );
}
