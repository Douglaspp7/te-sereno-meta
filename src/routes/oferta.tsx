import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { Star, CheckCircle2, ChevronRight, Play, Check, Lock, ChevronDown, Utensils, Leaf, PlayCircle, CalendarDays, Trophy, ListChecks, TrendingUp, Zap } from 'lucide-react'
import { trackEvent, captureUtmsFromUrl } from '@/lib/tracking'

export const Route = createFileRoute('/oferta')({
  component: QuizFunnel,
})

const quizData = {
  1: {
    title: "¿Cuál es tu principal objetivo en los próximos 21 días?",
    image: "/quiz/quiz_1.png",
    options: ["Perder grasa localizada", "Reducir medidas en el abdomen", "Desintoxicar el organismo", "Mejorar digestión y energía"],
    feedback: "Estamos analizando tu perfil metabólico..."
  },
  2: {
    title: "¿A qué hora sueles sentir más ansiedad por comer dulces o pan?",
    image: "/quiz/quiz_2.png",
    options: ["A media mañana", "Después del almuerzo", "Al final de la tarde/noche", "Antes de dormir"],
    feedback: "Excelente. Identificando tus patrones de hábitos..."
  },
  3: {
    title: "¿Cómo describirías tu metabolismo actualmente?",
    image: "/quiz/quiz_3.png",
    options: ["Rápido (Pierdo peso fácil)", "Normal (Pierdo si me cuido)", "Lento (Me cuesta adelgazar)", "Estancado (No bajo nada)"],
    feedback: "Esto nos ayuda a personalizar tu recomendación..."
  },
  4: {
    title: "¿Cuánta agua pura logras consumir al día?",
    image: "/quiz/quiz_4.png",
    options: ["Menos de 1 litro", "Entre 1 y 2 litros", "Más de 2 litros", "Casi no tomo agua pura"],
    feedback: "Entendido. Ajustando los parámetros de hidratación..."
  },
  5: {
    title: "Estamos listos para calcular tu plan. ¿Te comprometes a seguir el método 100% por 21 días?",
    image: "/quiz/quiz_5.png",
    options: ["Sí, estoy 100% comprometida", "¡Lista para empezar ahora!"],
    feedback: "Generando tu plan personalizado de 21 días..."
  }
}

function QuizFunnel() {
  const [step, setStep] = useState(0) // 0: Hero, 1-5: Quiz, 6: Loading, 7: VSL
  const [loadingStep, setLoadingStep] = useState(0)
  const quizStartedRef = useRef(false)

  // UTMify + funnel-entry events
  useEffect(() => {
    captureUtmsFromUrl();

    (window as any).pixelId = "6a2605a7414b09948518b289";
    const a = document.createElement("script");
    a.setAttribute("async", "");
    a.setAttribute("defer", "");
    a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
    document.head.appendChild(a);

    const b = document.createElement("script");
    b.setAttribute("async", "");
    b.setAttribute("defer", "");
    b.setAttribute("data-utmify-prevent-subids", "");
    b.setAttribute("src", "https://cdn.utmify.com.br/scripts/utms/latest.js");
    document.head.appendChild(b);

    // Fired on the very first page of the quiz funnel.
    trackEvent("QuizView");
    // /oferta route access also counts as the offer page entry.
    trackEvent("OfferView");
  }, []);

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setStep(s => s + 1)
  }

  useEffect(() => {
    if (step === 6) {
      const t1 = setTimeout(() => setLoadingStep(1), 1000)
      const t2 = setTimeout(() => setLoadingStep(2), 2000)
      const t3 = setTimeout(() => setLoadingStep(3), 3000)
      const t4 = setTimeout(() => setStep(7), 4000)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
        clearTimeout(t4)
      }
    }
  }, [step])

  if (step === 0) return <HeroScreen onNext={nextStep} />
  if (step >= 1 && step <= 5) return <QuizScreen step={step} onNext={nextStep} onFirstAnswer={() => {
    if (!quizStartedRef.current) { quizStartedRef.current = true; trackEvent("QuizStart"); }
  }} />
  if (step === 6) return <LoadingScreen loadingStep={loadingStep} />
  if (step === 7) return <VSLScreen />

  return null
}

function HeroScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="/quiz/hero_bg.png" alt="Hero Background" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>
      
      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
          Descubre por qué perder peso <span className="text-emerald-400">no depende de la motivación</span>
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-lg">
          Responde unas preguntas rápidas y descubre tu plan ideal para los próximos 21 días.
        </p>
        
        <button onClick={onNext} className="group relative inline-flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xl px-10 py-5 rounded-full transition-all duration-300 hover:scale-[1.05] shadow-[0_0_40px_-10px_rgba(16,185,129,0.8)]">
          Comenzar
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

function QuizScreen({ step, onNext, onFirstAnswer }: { step: number; onNext: () => void; onFirstAnswer: () => void }) {
  const data = quizData[step as keyof typeof quizData];
  const progress = (step / 5) * 100;
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    setSelectedOption(null);
    setShowFeedback(false);
  }, [step]);

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return;

    if (step === 1) onFirstAnswer();

    setSelectedOption(index);

    setTimeout(() => {
      setShowFeedback(true);

      if (step === 5) {
        trackEvent("QuizComplete", { metadata: { last_option: index } });
      }

      setTimeout(() => {
        onNext();
      }, 2000);

    }, 500);
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm">
        <div className="h-1.5 w-full bg-white/10">
          <div 
            className="h-full bg-emerald-500 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {showFeedback ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-background animate-in fade-in zoom-in-95 duration-500 z-40">
          <div className="w-20 h-20 mb-8 rounded-full bg-emerald-500/10 flex items-center justify-center animate-pulse">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground text-center max-w-md leading-tight animate-in slide-in-from-bottom-4 duration-700">
            {data.feedback}
          </h3>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row h-screen animate-in fade-in duration-500">
          <div className="w-full h-[40vh] md:h-full md:w-5/12 relative flex-shrink-0">
            <img src={data.image} alt="Quiz" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent md:bg-gradient-to-r md:from-transparent md:to-background" />
          </div>
          
          <div className="flex-1 bg-background flex flex-col px-6 pb-10 pt-6 md:pt-10 md:justify-center relative z-10 -mt-10 md:mt-0 rounded-t-[2.5rem] md:rounded-none shadow-[0_-20px_40px_rgba(0,0,0,0.3)] md:shadow-none">
            <div className="max-w-md w-full mx-auto animate-in slide-in-from-bottom-8 duration-700 delay-100 fill-mode-both">
              
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 font-bold text-sm">
                  {step}
                </span>
                <span className="text-muted-foreground font-medium text-sm tracking-wide">
                  de 5
                </span>
              </div>

              <h2 className="text-2xl md:text-4xl font-extrabold text-foreground mb-8 leading-tight">
                {data.title}
              </h2>
              
              <div className="space-y-3">
                {data.options.map((opt, i) => {
                  const isSelected = selectedOption === i;
                  const isDisabled = selectedOption !== null && !isSelected;
                  
                  return (
                    <button
                      key={i}
                      onClick={() => handleOptionClick(i)}
                      disabled={selectedOption !== null}
                      className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group 
                        ${isSelected 
                          ? 'bg-emerald-500 border-emerald-500 text-black scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                          : 'bg-card border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 text-foreground'
                        }
                        ${isDisabled ? 'opacity-40 scale-[0.98]' : 'opacity-100'}
                      `}
                    >
                      <span className="font-semibold text-base md:text-lg pr-4">{opt}</span>
                      
                      <div className={`w-6 h-6 rounded-full flex-shrink-0 border flex items-center justify-center transition-colors
                        ${isSelected 
                          ? 'border-black bg-black' 
                          : 'border-muted-foreground/30 group-hover:border-emerald-500/50'
                        }
                      `}>
                        {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingScreen({ loadingStep }: { loadingStep: number }) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="w-20 h-20 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-8" />
      
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 text-center animate-pulse">
        Analizando tus respuestas...
      </h2>
      
      <div className="space-y-4 max-w-sm w-full">
        <LoadingItem text="Hábitos actuales" active={loadingStep >= 1} />
        <LoadingItem text="Nivel de compromiso" active={loadingStep >= 2} />
        <LoadingItem text="Potencial de transformación" active={loadingStep >= 3} />
      </div>
    </div>
  )
}

function LoadingItem({ text, active }: { text: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${active ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5 opacity-40'}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${active ? 'bg-emerald-500 text-black' : 'bg-white/10 text-transparent'}`}>
        <Check className="w-4 h-4" />
      </div>
      <span className={`font-medium ${active ? 'text-white' : 'text-white/50'}`}>{text}</span>
    </div>
  )
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-red-600/90 backdrop-blur-sm text-white text-center py-3 font-bold text-sm md:text-base px-4 sticky top-0 z-40 border-b border-red-500 shadow-[0_4px_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2">
      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
      ¡OFERTA EXCLUSIVA! Termina en: <span className="notranslate" translate="no">{hours}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
    </div>
  )
}

const fakeBuyers = [
  { name: "Lucía M.", location: "Colombia", time: "hace 2 min" },
  { name: "Sofía R.", location: "México", time: "hace 4 min" },
  { name: "Valentina P.", location: "Chile", time: "hace 1 min" },
  { name: "Camila G.", location: "Argentina", time: "hace 3 min" },
  { name: "Martina V.", location: "España", time: "hace 5 min" },
  { name: "Isabella C.", location: "Perú", time: "hace 1 min" },
  { name: "Valeria S.", location: "Ecuador", time: "hace 2 min" },
];

function PurchaseNotifications() {
  const [currentNotif, setCurrentNotif] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start the first one quickly to hook the user
    const firstTimeout = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 6000);
    }, 8000);

    // Then pop up every 45 seconds (approx 2.5 per 2 minutes)
    const interval = setInterval(() => {
      setCurrentNotif(Math.floor(Math.random() * fakeBuyers.length));
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 6000);
    }, 45000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) return null;

  const notif = fakeBuyers[currentNotif];

  return (
    <div className="fixed bottom-6 left-4 md:left-6 z-50 bg-black/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-4 shadow-[0_10px_40px_rgba(16,185,129,0.3)] animate-in slide-in-from-bottom-8 fade-in duration-500">
      <div className="bg-emerald-500 rounded-full p-2 shrink-0">
        <CheckCircle2 className="w-5 h-5 text-black" />
      </div>
      <div>
        <p className="text-white text-sm font-bold">{notif.name} <span className="text-white/60 font-medium">compró MiReto21</span></p>
        <p className="text-emerald-400 text-xs font-medium mt-0.5">{notif.time} • {notif.location}</p>
      </div>
    </div>
  )
}

function VSLScreen() {
  const vsl75FiredRef = useRef(false);

  useEffect(() => {
    trackEvent("VSLView");
  }, []);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    if (!vsl75FiredRef.current && v.duration > 0 && v.currentTime / v.duration >= 0.75) {
      vsl75FiredRef.current = true;
      trackEvent("VSL75", { metadata: { duration: v.duration, current_time: v.currentTime } });
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      <CountdownTimer />
      <PurchaseNotifications />
      
      <div className="bg-emerald-500 text-black text-center py-2 font-bold text-sm px-4">
        ¡Tu plan personalizado ha sido generado con éxito!
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Tienes un <span className="text-emerald-400">excelente potencial</span> para lograr cambios reales.
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Basándonos en tus respuestas, creemos que un plan estructurado de 21 días puede ayudarte a crear hábitos saludables y sostenibles.
          </p>
        </div>
        
        <div className="relative w-full max-w-sm mx-auto aspect-[9/16] rounded-3xl overflow-hidden bg-black border border-emerald-500/30 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)] mb-12">
          <video 
            src="/vsl2.mp4" 
            poster="/vsl2_poster.jpg"
            controls 
            playsInline
            preload="metadata"
            controlsList="nodownload"
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-contain"
          >
            Tu navegador no soporta el elemento de video.
          </video>
        </div>


        <div className="max-w-md mx-auto mb-20">
          <div className="relative bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/30 rounded-3xl p-8 backdrop-blur-sm flex flex-col justify-center shadow-2xl">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50 rounded-t-3xl" />
            <div className="text-center mb-6">
              <h3 className="text-xl text-white/80 font-medium mb-4">Acceso Completo a MiReto21</h3>
              
              <img src="/promocional.png" alt="Aplicativo MiReto21" className="w-full max-w-xs mx-auto rounded-xl shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] border border-emerald-500/20 mb-6" />

              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-5xl font-extrabold text-white">$9</span>
                <span className="text-xl text-white/60 mt-2">USD</span>
              </div>
              <p className="text-emerald-400 text-sm font-bold bg-emerald-400/10 inline-block px-3 py-1 rounded-full">
                Oferta especial única
              </p>
            </div>
            
            <a 
              href="https://pay.hotmart.com/G106177128D" 
              className="block w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xl py-5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] text-center mb-4"
            >
              Quiero Empezar Ahora
            </a>
            <p className="text-xs text-white/40 text-center flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> Pago 100% seguro a través de Hotmart
            </p>
          </div>
        </div>

        {/* Nueva Sección de Value Stacking */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-lg">
              🎁 Todo lo que recibirás hoy
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                img: "/quiz/box_1.png",
                icon: Utensils,
                title: "63 Recetas Premium",
                desc: "Desayunos, almuerzos y cenas para los 21 días del programa."
              },
              {
                img: "/quiz/box_2.png",
                icon: Leaf,
                title: "21 Tés Funcionales",
                desc: "Una receta diferente cada día para complementar tu rutina saludable."
              },
              {
                img: "/quiz/box_3.png",
                icon: PlayCircle,
                title: "Biblioteca de Ejercicios",
                desc: "Vídeos guiados para principiantes y nivel intermedio."
              },
              {
                img: "/quiz/box_4.png",
                icon: CalendarDays,
                title: "Plan Diario de 21 Días",
                desc: "Sabrás exactamente qué hacer cada día."
              },
              {
                img: "/quiz/box_5.png",
                icon: Trophy,
                title: "Sistema de Recompensas",
                desc: "Desbloquea contenido especial conforme avances."
              },
              {
                img: "/quiz/box_6.png",
                icon: ListChecks,
                title: "Lista Inteligente de Compras",
                desc: "Todos los ingredientes organizados para cada semana."
              },
              {
                img: "/quiz/box_7.png",
                icon: TrendingUp,
                title: "Seguimiento de Progreso",
                desc: "Monitorea tu avance durante los 21 días."
              },
              {
                img: "/quiz/box_8.png",
                icon: Zap,
                title: "Acceso Inmediato",
                desc: "Disponible desde tu móvil, tablet o computadora."
              }
            ].map((box, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:bg-white/10 hover:border-emerald-500/30 hover:-translate-y-2 transition-all duration-300 group flex flex-col">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img src={box.img} alt={box.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-sm text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg border border-emerald-400">
                    ⭐ Incluido
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 w-10 h-10 bg-black/50 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                    <box.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{box.title}</h3>
                  <p className="text-white/70 text-sm flex-1">{box.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto bg-gradient-to-b from-white/10 to-transparent border border-white/20 rounded-3xl p-8 md:p-12 backdrop-blur-lg shadow-2xl relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black font-extrabold px-6 py-2 rounded-full text-sm tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-300">
              VALOR TOTAL INCLUIDO
            </div>
            
            <div className="space-y-4 mb-8 mt-4">
              {[
                { name: "63 Recetas Premium", price: "US$29" },
                { name: "21 Recetas de Té", price: "US$19" },
                { name: "Biblioteca de Ejercicios", price: "US$27" },
                { name: "Sistema de Recompensas", price: "US$17" },
                { name: "Planificador de 21 Días", price: "US$37" }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-white/80 font-medium">{item.name}</span>
                  <span className="text-emerald-400 font-bold">{item.price}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center border-t border-white/20 pt-8 mb-8">
              <div className="text-white/50 text-lg font-medium flex items-center gap-2 mb-2">
                Valor Total: <span className="line-through decoration-red-500/70 decoration-2">US$129</span>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-white/80 text-xl font-medium pb-2">Hoy destacado:</span>
                <div className="flex items-start gap-1">
                  <span className="text-6xl font-black text-emerald-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.6)]">US$9</span>
                </div>
              </div>
            </div>

            <a 
              href="https://pay.hotmart.com/G106177128D" 
              className="group relative flex items-center justify-center w-full bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-black font-extrabold text-2xl py-6 rounded-2xl transition-all hover:scale-[1.03] active:scale-[0.98] shadow-[0_0_50px_-10px_rgba(16,185,129,0.8)] border border-emerald-300/50 mb-4 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center gap-3">
                QUIERO ACCEDER AHORA <ChevronRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
            
            <div className="flex items-center justify-center gap-2 text-white/50 text-xs font-medium">
              <Lock className="w-3 h-3" /> Acceso inmediato • Pago único • Disponible 24/7
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center text-white mb-10">Más de 10,000 personas ya lo lograron</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "María S.", avatar: "https://randomuser.me/api/portraits/women/44.jpg", text: "Increíble. Perdí 4 kilos y nunca me sentí tan llena de energía. ¡Súper recomendado!" },
              { name: "Laura G.", avatar: "https://randomuser.me/api/portraits/women/68.jpg", text: "Las recetas son súper fáciles de hacer y ricas. El grupo de apoyo es lo mejor." },
              { name: "Ana P.", avatar: "https://randomuser.me/api/portraits/women/90.jpg", text: "Había intentado todo, pero estos 21 días me cambiaron la vida. Ya no sufro por la comida." }
            ].map((testi, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:bg-white/10 transition-colors duration-300">
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-500 text-amber-500" />)}
                  </div>
                  <p className="text-white/90 text-sm italic mb-6 leading-relaxed">"{testi.text}"</p>
                </div>
                <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                  <img src={testi.avatar} alt={testi.name} className="w-10 h-10 rounded-full border border-emerald-500/50 object-cover" />
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-1">
                      {testi.name} <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    </div>
                    <div className="text-white/40 text-xs">Compradora verificada</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-white mb-10">Preguntas Frecuentes</h3>
          <div className="space-y-4">
            {[
              { q: "¿Es un pago único o una suscripción mensual?", a: "Es un pago único. Tendrás acceso al programa completo sin cargos ocultos." },
              { q: "¿Necesito equipo especial para los ejercicios?", a: "No, todos los ejercicios están diseñados para hacerse en casa con tu propio peso corporal." },
              { q: "¿Sirve para mí si tengo poco tiempo?", a: "¡Sí! El programa está diseñado para personas ocupadas. Todo toma menos de 30 minutos al día." }
            ].map((faq, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 group cursor-pointer hover:bg-white/10 transition-colors">
                <h4 className="font-bold text-white flex items-center justify-between">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-white/60 text-sm mt-3">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-white/10 bg-black/50 py-12 px-4 text-center">
        <p className="text-white/40 text-sm mb-4">
          © {new Date().getFullYear()} MiReto21. Todos los derechos reservados.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-xs text-white/30">
          <a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a>
          <a href="#" className="hover:text-white transition-colors">Políticas de Privacidad</a>
          <a href="#" className="hover:text-white transition-colors">Contacto</a>
        </div>
        <p className="mt-6 text-[10px] text-white/20 max-w-3xl mx-auto">
          Este sitio no es parte del sitio web de Facebook o Facebook Inc. Además, este sitio NO está respaldado por Facebook de ninguna manera. FACEBOOK es una marca registrada de FACEBOOK, Inc.
        </p>
      </footer>
    </div>
  )
}
