import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { Star, CheckCircle2, ChevronRight, Play, Check, Lock, ChevronDown, Utensils, Leaf, PlayCircle, CalendarDays, Trophy, ListChecks, TrendingUp, Zap, Smartphone, Target, Sparkles, ShieldCheck, CreditCard, Clock, HeartHandshake } from 'lucide-react'
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
  const [step, setStep] = useState(7) // SKIP quiz — go straight to VSL (0: Hero, 1-5: Quiz, 6: Loading, 7: VSL)
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

    // One-per-session "landing" and "ad click" events for funnel top.
    try {
      const sid = localStorage.getItem("mireto21:sid") || "";
      const landedKey = `mireto21:landed:${sid}`;
      if (!localStorage.getItem(landedKey)) {
        localStorage.setItem(landedKey, "1");
        trackEvent("LandingView", {
          metadata: { referrer: document.referrer || null, path: window.location.pathname },
        });
        const params = new URLSearchParams(window.location.search);
        const utmSource = params.get("utm_source");
        const fbclid = params.get("fbclid");
        const gclid = params.get("gclid");
        if (utmSource || fbclid || gclid) {
          trackEvent("AdClick", {
            metadata: { utm_source: utmSource, fbclid, gclid },
          });
        }
      }
    } catch {}
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
  const DURATION = 15 * 60; // 15 minutes
  const [timeLeft, setTimeLeft] = useState(DURATION);

  useEffect(() => {
    try {
      const key = "mireto21:offer_deadline";
      let deadline = Number(localStorage.getItem(key) || 0);
      const now = Date.now();
      if (!deadline || deadline < now) {
        deadline = now + DURATION * 1000;
        localStorage.setItem(key, String(deadline));
      }
      const tick = () => {
        const left = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
        setTimeLeft(left);
      };
      tick();
      const timer = setInterval(tick, 1000);
      return () => clearInterval(timer);
    } catch {
      const timer = setInterval(() => setTimeLeft(p => (p > 0 ? p - 1 : 0)), 1000);
      return () => clearInterval(timer);
    }
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

function CtaButton({ id, label = "Quiero comenzar ahora" }: { id: string; label?: string }) {
  return (
    <a
      href="https://pay.hotmart.com/G106177128D"
      onClick={() => trackEvent("InitiateCheckout", { metadata: { cta: id } })}
      className="group relative block w-full bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-extrabold text-lg md:text-xl py-5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_40px_-10px_rgba(16,185,129,0.8)] text-center"
    >
      <span className="inline-flex items-center justify-center gap-2">
        {label} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </span>
    </a>
  );
}

function TrustBadges() {
  const items = [
    { icon: CreditCard, text: "Pago único" },
    { icon: Zap, text: "Acceso inmediato" },
    { icon: ShieldCheck, text: "Garantía de 7 días" },
    { icon: Lock, text: "Compra segura · Hotmart" },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {items.map((b, i) => (
        <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
          <b.icon className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[12px] font-semibold text-white/85 truncate">{b.text}</span>
        </div>
      ))}
    </div>
  );
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

  const heroBullets = [
    "Alimentación guiada",
    "Rutinas simples desde casa",
    "Lista de compras inteligente",
    "Seguimiento diario",
    "Recompensas por completar el reto",
  ];

  const steps = [
    { icon: Smartphone, title: "Abre la aplicación", desc: "Cada mañana tendrás todo listo en tu celular." },
    { icon: Target, title: "Completa la misión diaria", desc: "Pequeñas acciones simples, pensadas para tu día." },
    { icon: Sparkles, title: "Construye hábitos en 21 días", desc: "Sin esfuerzo extra. Solo sigue el plan." },
  ];

  const includes = [
    { icon: Smartphone, title: "Acceso completo a MiReto21", desc: "Tu app personal de 21 días, lista para usar." },
    { icon: CalendarDays, title: "Plan guiado de 21 días", desc: "Te decimos exactamente qué hacer cada día." },
    { icon: Utensils, title: "63 recetas premium", desc: "Desayuno, almuerzo y cena con ingredientes simples." },
    { icon: Leaf, title: "Biblioteca de tés funcionales", desc: "21 recetas naturales para apoyar tu reto." },
    { icon: ListChecks, title: "Lista de compras inteligente", desc: "Todo lo que necesitas, organizado por semana." },
    { icon: Trophy, title: "Sistema de recompensas", desc: "Desbloquea contenido al avanzar." },
    { icon: TrendingUp, title: "Seguimiento del progreso", desc: "Mira tu evolución día a día." },
    { icon: Zap, title: "Actualizaciones futuras", desc: "Nuevas recetas y mejoras sin costo adicional." },
  ];

  const gallery = [
    { src: "/mi_plan_real.webp", label: "Día 1 de 21" },
    { src: "/recetas_real.webp", label: "Misiones diarias" },
    { src: "/compras_real.webp", label: "Lista de compras" },
    { src: "/recompensas_botao.png", label: "Recompensas" },
    { src: "/progreso_real.webp", label: "Seguimiento" },
    { src: "/ejercicios_real.webp", label: "Rutinas guiadas" },
  ];

  const forYou = [
    "Has intentado comenzar muchas veces y abandonas rápido",
    "Necesitas una guía paso a paso",
    "No sabes por dónde empezar",
    "Quieres crear hábitos más saludables",
    "Prefieres usar tu celular como apoyo diario",
  ];

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      <CountdownTimer />

      {/* ============ HERO ============ */}
      <section className="relative px-4 pt-8 pb-12 md:pt-14 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.18),transparent_60%)]" />
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          {/* Mockup */}
          <div className="order-2 md:order-1 relative flex justify-center">
            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
            <img
              src="/promocional.png"
              alt="App MiReto21 — Reto de 21 días"
              className="relative w-full max-w-xs md:max-w-sm rounded-3xl"
            />
            <div className="absolute -top-3 -right-2 md:top-2 md:right-4 bg-emerald-500 text-black font-extrabold text-xs px-4 py-2 rounded-full shadow-lg border border-emerald-300 rotate-3">
              21 DÍAS
            </div>
          </div>

          {/* Copy + CTA */}
          <div className="order-1 md:order-2 text-center md:text-left">
            <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300 mb-4">
              <Sparkles className="w-3 h-3" /> Reto guiado de 21 días
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-[1.1] mb-4">
              Tu único trabajo es <span className="text-emerald-400">abrir la app</span> cada día durante 21 días.
            </h1>
            <p className="text-base md:text-lg text-white/75 mb-6 max-w-xl mx-auto md:mx-0">
              Nosotros te mostramos exactamente qué hacer: planes de alimentación, rutinas simples, lista de compras y pequeñas misiones diarias para crear hábitos saludables.
            </p>

            <ul className="grid grid-cols-1 gap-2 mb-7 max-w-md mx-auto md:mx-0">
              {heroBullets.map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-white/90 text-sm md:text-base">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" strokeWidth={3} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            <div className="max-w-md mx-auto md:mx-0 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-end justify-center md:justify-start gap-2 mb-1">
                <span className="text-white/60 text-sm pb-2">Hoy por solo</span>
                <span className="text-5xl font-black text-emerald-400 leading-none drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">US$9</span>
              </div>
              <p className="text-xs text-emerald-300 font-bold text-center md:text-left mb-4">
                Oferta especial por tiempo limitado
              </p>
              <CtaButton id="hero_primary" />
              <TrustBadges />
            </div>
          </div>
        </div>
      </section>

      {/* ============ VIDEO ============ */}
      <section className="px-4 py-12 md:py-16 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-3xl mx-auto text-center mb-6">
          <h2 className="text-2xl md:text-4xl font-extrabold text-white">
            Descubre cómo funciona <span className="text-emerald-400">MiReto21</span>
          </h2>
          <p className="text-white/60 text-sm md:text-base mt-2">Un vistazo rápido a tu reto de 21 días.</p>
        </div>
        <div className="relative w-full max-w-sm mx-auto aspect-[9/16] rounded-3xl overflow-hidden bg-black border border-emerald-500/30 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]">
          <video
            src="/vsl2.mp4"
            poster="/vsl2_poster.jpg"
            controls
            autoPlay
            muted
            playsInline
            preload="auto"
            controlsList="nodownload"
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-contain"
          >
            Tu navegador no soporta el elemento de video.
          </video>
        </div>
      </section>

      {/* ============ ASÍ FUNCIONA ============ */}
      <section className="px-4 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white">Así funciona</h2>
            <p className="text-white/60 mt-2">Tres pasos. Cada día.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <div key={i} className="relative bg-gradient-to-b from-white/[0.06] to-transparent border border-white/10 rounded-3xl p-6 hover:border-emerald-500/30 transition-colors">
                <div className="absolute -top-3 -left-3 w-9 h-9 rounded-2xl bg-emerald-500 text-black font-extrabold flex items-center justify-center shadow-lg">
                  {i + 1}
                </div>
                <s.icon className="w-8 h-8 text-emerald-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-white/65 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TODO LO QUE RECIBIRÁS ============ */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white">Todo lo que recibirás</h2>
            <p className="text-white/60 mt-2">Acceso completo, listo para usar hoy mismo.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {includes.map((it, i) => (
              <div key={i} className="group bg-gradient-to-b from-white/[0.06] to-transparent border border-white/10 rounded-2xl p-5 hover:border-emerald-500/40 hover:-translate-y-1 transition-all">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:bg-emerald-500/25 transition-colors">
                  <it.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-bold text-white mb-1">{it.title}</h3>
                <p className="text-white/60 text-sm">{it.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ASÍ SE VE TU RETO ============ */}
      <section className="px-4 py-14 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white">Así se ve tu reto</h2>
            <p className="text-white/70 mt-3 text-base">
              No necesitas adivinar qué hacer. <span className="text-emerald-400 font-semibold">MiReto21 organiza cada paso por ti.</span>
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((g, i) => (
              <div key={i} className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] aspect-[3/4] group">
                <img src={g.src} alt={g.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">{g.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ¿ES PARA TI? ============ */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white">¿Es para ti?</h2>
            <p className="text-white/60 mt-2">MiReto21 es ideal si:</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {forYou.map((t, i) => (
              <div key={i} className="flex items-start gap-3 bg-gradient-to-b from-white/[0.06] to-transparent border border-white/10 rounded-2xl p-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-white/85 text-sm leading-relaxed">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ GARANTÍA ============ */}
      <section className="px-4 py-14 md:py-20">
        <div className="max-w-3xl mx-auto bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/30 rounded-3xl p-8 md:p-10 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 mb-6">
              <ShieldCheck className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Prueba MiReto21 sin riesgo</h2>
            <p className="text-white/75 text-base md:text-lg max-w-xl mx-auto">
              Si consideras que MiReto21 no es para ti, podrás solicitar el reembolso dentro del período establecido por Hotmart.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-white/5 border border-white/15 rounded-full px-4 py-2 text-sm font-bold text-emerald-300">
              <HeartHandshake className="w-4 h-4" /> 7 días de garantía total
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-3">
            Tu reto de <span className="text-emerald-400">21 días</span> comienza hoy
          </h2>
          <p className="text-white/70 text-base md:text-lg mb-8">
            Todo lo que necesitas ya está listo dentro de la aplicación.
          </p>

          <div className="bg-gradient-to-b from-white/[0.06] to-transparent border border-white/15 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
            <div className="flex items-end justify-center gap-2 mb-1">
              <span className="text-white/60 text-sm pb-2">Hoy por solo</span>
              <span className="text-6xl font-black text-emerald-400 leading-none drop-shadow-[0_0_25px_rgba(16,185,129,0.6)]">US$9</span>
            </div>
            <p className="text-xs text-emerald-300 font-bold mb-6">Pago único · Acceso inmediato</p>
            <CtaButton id="final_cta" />
            <TrustBadges />
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-white mb-8">Preguntas frecuentes</h3>
          <div className="space-y-3">
            {[
              { q: "¿Es un pago único o una suscripción?", a: "Es un pago único de US$9. Sin cargos recurrentes ni cobros ocultos." },
              { q: "¿Cómo recibo el acceso?", a: "El acceso es inmediato. Después del pago recibirás un correo con tus datos para entrar a la app." },
              { q: "¿Necesito equipo para los ejercicios?", a: "No. Las rutinas son simples y se hacen en casa, sin equipo." },
              { q: "¿Y si no funciona para mí?", a: "Tienes 7 días de garantía a través de Hotmart. Si no es para ti, te devolvemos tu dinero." },
            ].map((faq, i) => (
              <details key={i} className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-colors">
                <summary className="font-bold text-white flex items-center justify-between cursor-pointer list-none">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-emerald-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-white/65 text-sm mt-3 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black/50 py-10 px-4 text-center">
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
  );
}

