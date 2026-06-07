import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Star, CheckCircle2, ChevronRight, Play, Check, Lock, ChevronDown, Utensils, Leaf, PlayCircle, CalendarDays, Trophy, ListChecks, TrendingUp, Zap } from 'lucide-react'

export const Route = createFileRoute('/oferta')({
  component: QuizFunnel,
})

const quizData = {
  1: {
    title: "¿Cuál es tu principal objetivo?",
    image: "/quiz/quiz_1.png",
    options: ["Perder peso", "Reducir barriga", "Crear hábitos saludables", "Sentirme con más energía"]
  },
  2: {
    title: "¿Cuántas veces has intentado adelgazar?",
    image: "/quiz/quiz_2.png",
    options: ["Nunca", "1 a 2 veces", "3 a 5 veces", "Muchas veces"]
  },
  3: {
    title: "¿Cuál es tu mayor dificultad?",
    image: "/quiz/quiz_3.png",
    options: ["Ansiedad", "Falta de tiempo", "No sé qué comer", "No consigo ser constante"]
  },
  4: {
    title: "¿Cuánto peso te gustaría perder?",
    image: "/quiz/quiz_4.png",
    options: ["Menos de 5 kg", "5 a 10 kg", "10 a 20 kg", "Más de 20 kg"]
  },
  5: {
    title: "¿Estás dispuesta a seguir un plan durante 21 días?",
    image: "/quiz/quiz_5.png",
    options: ["Sí", "Claro que sí"]
  }
}

function QuizFunnel() {
  const [step, setStep] = useState(0) // 0: Hero, 1-5: Quiz, 6: Loading, 7: VSL
  const [loadingStep, setLoadingStep] = useState(0)

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
  if (step >= 1 && step <= 5) return <QuizScreen step={step} onNext={nextStep} />
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

function QuizScreen({ step, onNext }: { step: number; onNext: () => void }) {
  const data = quizData[step as keyof typeof quizData];
  const progress = (step / 5) * 100;

  return (
    <div className="min-h-screen bg-black flex flex-col transition-opacity duration-500">
      <div className="w-full bg-white/10 h-2">
        <div 
          className="bg-emerald-500 h-2 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 h-[30vh] md:h-auto relative">
          <img src={data.image} alt="Quiz" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent md:bg-gradient-to-r md:from-transparent md:to-black" />
        </div>
        
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-10 md:p-12 relative z-10 -mt-10 md:mt-0">
          <div className="max-w-md w-full mx-auto">
            <span className="text-emerald-500 font-bold tracking-widest text-sm uppercase mb-2 block">
              Pregunta {step} de 5
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 drop-shadow-md">
              {data.title}
            </h2>
            
            <div className="space-y-4">
              {data.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={onNext}
                  className="w-full text-left p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all text-white font-medium text-lg flex items-center justify-between group shadow-lg backdrop-blur-md"
                >
                  {opt}
                  <div className="w-6 h-6 rounded-full border border-white/30 group-hover:border-emerald-500 group-hover:bg-emerald-500 flex items-center justify-center transition-all">
                    <Check className="w-4 h-4 text-transparent group-hover:text-black" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
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

function VSLScreen() {
  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
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
        
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)] mb-12 group">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center backdrop-blur-md border border-emerald-500/50 group-hover:scale-110 transition-transform cursor-pointer z-10">
              <Play className="w-8 h-8 text-emerald-500 ml-1" />
            </div>
          </div>
          <div className="absolute bottom-4 left-0 right-0 text-center text-white/50 text-sm font-medium z-10">
            (Vídeo de Vendas aqui)
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-6">Tu plan incluye:</h3>
            <ul className="space-y-4">
              {[
                "Plan diario durante 21 días",
                "Recetas saludables",
                "Té del día",
                "Ejercicios sencillos",
                "Sistema de recompensas",
                "Acceso desde cualquier dispositivo"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-white/80 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

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
              { name: "María S.", text: "Increíble. Perdí 4 kilos y nunca me sentí tan llena de energía. ¡Súper recomendado!" },
              { name: "Laura G.", text: "Las recetas son súper fáciles de hacer y ricas. El grupo de apoyo es lo mejor." },
              { name: "Ana P.", text: "Había intentado todo, pero estos 21 días me cambiaron la vida. Ya no sufro por la comida." }
            ].map((testi, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-500 text-amber-500" />)}
                </div>
                <p className="text-white/80 text-sm italic mb-4">"{testi.text}"</p>
                <div className="font-bold text-white text-sm">{testi.name}</div>
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
