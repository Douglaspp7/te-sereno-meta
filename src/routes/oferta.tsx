import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, ChevronRight, Star, Target, Utensils, Zap, ShieldCheck, BrainCircuit, Activity, XCircle, Lock } from 'lucide-react'

export const Route = createFileRoute('/oferta')({
  component: OfertaComponent,
})

function OfertaComponent() {
  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-amber-500/30 overflow-x-hidden">
      {/* Background glow effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      
      {/* Hero Section */}
      <section className="relative px-4 pt-24 pb-16 md:pt-32 md:pb-24 max-w-5xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-medium tracking-wide text-white/80">Más de 10,000 vidas transformadas</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
          Transforma tus hábitos y <br className="hidden md:block" /> tu cuerpo en <span className="text-emerald-500">21 días</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl">
          El único programa impulsado por Inteligencia Artificial que se adapta a tu estilo de vida, gustos y metas. Sin dietas restrictivas, sin pasar hambre.
        </p>
        
        <a href="#comprar" className="group relative inline-flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]">
          Sí, Quiero Transformarme
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>
      </section>

      {/* Pain Points */}
      <section className="relative px-4 py-20 bg-white/5 border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">¿Por qué las dietas normales siempre fallan?</h2>
            <p className="text-white/60">El problema no eres tú. Es el sistema tradicional que está diseñado para romperse.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-3">
                <XCircle className="w-6 h-6" /> El Método Antiguo
              </h3>
              <ul className="space-y-4">
                {[
                  "Dietas genéricas y aburridas",
                  "Pasar hambre todo el día",
                  "Efecto rebote garantizado",
                  "Cero motivación diaria",
                  "Difícil de mantener en el tiempo"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/70">
                    <span className="mt-1 text-red-500/70">✕</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px]" />
              <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6" /> El Método MiReto21
              </h3>
              <ul className="space-y-4">
                {[
                  "100% Personalizado por IA",
                  "Comes lo que te gusta",
                  "Resultados sostenibles",
                  "Acompañamiento 24/7",
                  "Construye hábitos para siempre"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/90 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">¿Qué incluye el programa?</h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Todo lo que necesitas para garantizar tu éxito, en la palma de tu mano.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: BrainCircuit,
              title: "Coach de IA 24/7",
              desc: "Un asistente inteligente que resuelve tus dudas, ajusta tu plan y te motiva en tiempo real.",
              color: "text-blue-400",
              bg: "bg-blue-400/10"
            },
            {
              icon: Utensils,
              title: "Recetas Deliciosas",
              desc: "Plan de comidas adaptado a tus gustos. Nada de comer solo pollo y lechuga.",
              color: "text-amber-400",
              bg: "bg-amber-400/10"
            },
            {
              icon: Target,
              title: "Retos Diarios",
              desc: "Pequeñas acciones diarias que construyen grandes hábitos sostenibles en el tiempo.",
              color: "text-emerald-400",
              bg: "bg-emerald-400/10"
            },
            {
              icon: Activity,
              title: "Plan de Ejercicio",
              desc: "Rutinas cortas y efectivas para hacer en casa o en el gimnasio, según tu nivel.",
              color: "text-rose-400",
              bg: "bg-rose-400/10"
            },
            {
              icon: Zap,
              title: "Tracker de Progreso",
              desc: "Visualiza tu avance diario, celebra tus victorias y mantén la motivación a tope.",
              color: "text-purple-400",
              bg: "bg-purple-400/10"
            },
            {
              icon: Star,
              title: "Comunidad VIP",
              desc: "Acceso exclusivo a un grupo de personas con tus mismos objetivos y mentalidad.",
              color: "text-yellow-400",
              bg: "bg-yellow-400/10"
            }
          ].map((feature, i) => (
            <div key={i} className="group p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-white/60 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing & CTA */}
      <section id="comprar" className="px-4 py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="max-w-lg mx-auto relative">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
            
            <h2 className="text-3xl font-bold text-white mb-2">Comienza Hoy Mismo</h2>
            <p className="text-white/60 mb-8">Acceso instantáneo a todo el programa</p>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-3xl text-white/40 line-through decoration-red-500/50 decoration-2">$97</span>
              <span className="text-6xl font-extrabold text-white tracking-tight">$47</span>
              <span className="text-emerald-500 font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-sm mt-2">50% OFF</span>
            </div>

            <a href="#" className="block w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xl py-5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] mb-6">
              Comprar Ahora
            </a>
            
            <p className="text-sm text-white/40 flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" /> Pago 100% seguro y encriptado
            </p>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="px-4 pb-24 max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8 bg-white/5 border border-white/10 p-8 rounded-3xl">
          <div className="w-24 h-24 shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-12 h-12 text-black" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-2">Garantía de 7 Días</h3>
            <p className="text-white/60">
              Estamos tan seguros de que este programa cambiará tu vida, que te ofrecemos 7 días de garantía incondicional. Si no estás 100% satisfecho, te devolvemos tu dinero sin hacer preguntas.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-white/40 text-sm">
        <p>© {new Date().getFullYear()} MiReto21. Todos los derechos reservados.</p>
        <p className="mt-2 text-xs opacity-60">Los resultados pueden variar según cada persona. Consulta a un médico antes de iniciar cualquier programa de ejercicios o dieta.</p>
      </footer>
    </div>
  )
}
