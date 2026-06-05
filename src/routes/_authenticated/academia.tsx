import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Clock, Heart, Award, ChevronRight, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { academiaDocuments, AcademiaCategory } from "@/data/academia";

export const Route = createFileRoute("/_authenticated/academia")({
  component: AcademiaRoute,
});

function AcademiaRoute() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<AcademiaCategory | 'Todos'>('Todos');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [readProgress, setReadProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const savedFavs = localStorage.getItem('academia_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    
    const savedProgress = localStorage.getItem('academia_progress');
    if (savedProgress) setReadProgress(JSON.parse(savedProgress));
  }, []);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newFavs = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('academia_favorites', JSON.stringify(newFavs));
  };

  const categories: (AcademiaCategory | 'Todos')[] = ['Todos', 'Nutrición', 'Hábitos', 'Bienestar', 'Actividad Física', 'Guías Especiales'];

  const filteredDocs = activeCategory === 'Todos' 
    ? academiaDocuments 
    : academiaDocuments.filter(d => d.category === activeCategory);

  const docsReadCount = Object.values(readProgress).filter(p => p > 90).length;

  return (
    <div className="min-h-screen bg-background pb-24 font-sans selection:bg-primary/20">
      {/* Header Premium */}
      <div className="relative overflow-hidden bg-foreground text-background">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50" />
        <div className="relative px-6 pt-14 pb-8">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => navigate({ to: "/" })}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors active:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-medium tracking-tight">Academia MiReto21</h1>
          </div>
          
          <h2 className="text-3xl font-display font-bold leading-tight mb-3">
            Bienvenido a tu<br/>transformación.
          </h2>
          <p className="text-white/70 text-[15px] leading-relaxed max-w-[90%]">
            Aprende los principios fundamentales que te ayudarán a mantener tus resultados para toda la vida.
          </p>
        </div>
      </div>

      {/* Gamification / Achievements */}
      <div className="px-5 -mt-6 relative z-10 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-full grid place-items-center ${docsReadCount > 0 ? 'bg-amber-100 text-amber-500' : 'bg-secondary/30 text-muted-foreground'}`}>
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Progreso</p>
              <p className="text-sm font-bold text-foreground">
                {docsReadCount === 0 ? 'Comienza a leer' : 
                 docsReadCount >= 3 ? 'Alumno Dedicado' : 'Primer documento leído'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-primary">{docsReadCount}<span className="text-sm text-muted-foreground">/{academiaDocuments.length}</span></p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase">Completados</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 mb-6 overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-2 pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                activeCategory === cat 
                  ? 'bg-foreground text-background shadow-md' 
                  : 'bg-white border border-border/60 text-muted-foreground hover:border-foreground/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <div className="px-5 space-y-5">
        {filteredDocs.map(doc => {
          const isFav = favorites.includes(doc.id);
          const progress = readProgress[doc.id] || 0;
          
          return (
            <div 
              key={doc.id}
              onClick={() => navigate({ to: `/academia/read/$docId`, params: { docId: doc.id } })}
              className="group bg-white rounded-[1.5rem] p-4 shadow-sm border border-border/40 flex gap-4 active:scale-[0.98] transition-all cursor-pointer"
            >
              {/* Cover Image */}
              <div className="relative w-[100px] h-[130px] shrink-0 rounded-xl overflow-hidden bg-secondary">
                <img src={doc.coverImage} alt={doc.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/20 backdrop-blur-md rounded px-1.5 py-0.5 text-[10px] text-white font-medium">
                  <FileText className="w-3 h-3" />
                  {doc.pages}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col py-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-base font-bold text-foreground leading-tight line-clamp-2">
                    {doc.title}
                  </h3>
                  <button 
                    onClick={(e) => toggleFavorite(e, doc.id)}
                    className={`shrink-0 p-1.5 rounded-full transition-colors ${isFav ? 'bg-red-50 text-red-500' : 'bg-secondary/50 text-muted-foreground'}`}
                  >
                    <Heart className="h-4 w-4" fill={isFav ? "currentColor" : "none"} />
                  </button>
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-2 mb-auto leading-relaxed">
                  {doc.description}
                </p>

                <div className="mt-3">
                  {progress > 0 ? (
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-primary mb-1.5">
                        <span>Leído {Math.round(progress)}%</span>
                        <span>Continuar</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                        <Clock className="w-3 h-3" />
                        {doc.readTime}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-foreground">
                        Leer ahora <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
