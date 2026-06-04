export type Difficulty = "Fácil" | "Media" | "Avanzada";

export interface Recipe {
  id: string;
  name: string;
  category: string;
  ingredients: string[];
  preparation: string[];
  benefits: string[];
  schedule: string;
  time: string;
  difficulty: Difficulty;
  warning?: string;
  emoji: string;
}

export const CATEGORIES = [
  { id: "metabolismo", name: "Acelerar metabolismo", emoji: "🔥", color: "oklch(0.85 0.1 50)" },
  { id: "ansiedad", name: "Reducir ansiedad", emoji: "🌿", color: "oklch(0.85 0.06 150)" },
  { id: "liquidos", name: "Retención de líquidos", emoji: "💧", color: "oklch(0.85 0.07 220)" },
  { id: "digestivo", name: "Digestivo", emoji: "🍵", color: "oklch(0.88 0.08 100)" },
  { id: "quemar", name: "Quemar grasa", emoji: "✨", color: "oklch(0.82 0.12 35)" },
  { id: "dormir", name: "Antes de dormir", emoji: "🌙", color: "oklch(0.78 0.06 280)" },
  { id: "energetico", name: "Energético", emoji: "⚡", color: "oklch(0.85 0.13 85)" },
  { id: "detox", name: "Detox", emoji: "🌱", color: "oklch(0.82 0.09 145)" },
  { id: "apetito", name: "Controlar apetito", emoji: "🫖", color: "oklch(0.85 0.08 320)" },
  { id: "digestion", name: "Mejorar digestión", emoji: "🌼", color: "oklch(0.88 0.1 90)" },
] as const;

const HERBS: Record<string, string[]> = {
  metabolismo: ["té verde", "jengibre", "canela", "pimienta de cayena", "limón", "cúrcuma", "matcha", "rooibos"],
  ansiedad: ["manzanilla", "lavanda", "tila", "valeriana", "melisa", "pasiflora", "hierbabuena", "rosa mosqueta"],
  liquidos: ["cola de caballo", "diente de león", "perejil", "té verde", "abedul", "ortiga", "alcachofa", "hibisco"],
  digestivo: ["menta", "anís", "hinojo", "manzanilla", "jengibre", "cardamomo", "comino", "regaliz"],
  quemar: ["té verde", "oolong", "jengibre", "pimienta", "canela", "limón", "matcha", "cúrcuma"],
  dormir: ["manzanilla", "valeriana", "lavanda", "tila", "melisa", "pasiflora", "amapola", "lúpulo"],
  energetico: ["mate", "guaraná", "té negro", "ginseng", "matcha", "rooibos", "chai", "café verde"],
  detox: ["diente de león", "cardo mariano", "ortiga", "té verde", "jengibre", "limón", "menta", "cúrcuma"],
  apetito: ["garcinia", "té verde", "hinojo", "canela", "jengibre", "yerba mate", "menta", "regaliz"],
  digestion: ["menta", "manzanilla", "jengibre", "anís", "hinojo", "boldo", "regaliz", "comino"],
};

const BENEFITS: Record<string, string[]> = {
  metabolismo: ["Estimula el metabolismo", "Mejora la termogénesis", "Aumenta el gasto calórico", "Favorece la oxidación de grasas"],
  ansiedad: ["Calma el sistema nervioso", "Reduce el estrés", "Mejora el ánimo", "Favorece la relajación"],
  liquidos: ["Efecto diurético natural", "Reduce hinchazón", "Elimina toxinas", "Mejora la circulación"],
  digestivo: ["Alivia la pesadez", "Reduce gases", "Calma el estómago", "Mejora la digestión"],
  quemar: ["Ayuda a quemar grasa", "Acelera el metabolismo", "Aporta antioxidantes", "Reduce la grasa abdominal"],
  dormir: ["Induce el sueño", "Relaja la mente", "Mejora la calidad del descanso", "Reduce el insomnio"],
  energetico: ["Aporta energía natural", "Mejora la concentración", "Combate la fatiga", "Activa el organismo"],
  detox: ["Depura el hígado", "Elimina toxinas", "Limpia el organismo", "Mejora la piel"],
  apetito: ["Reduce el apetito", "Controla la ansiedad por comer", "Aporta sensación de saciedad", "Estabiliza el azúcar en sangre"],
  digestion: ["Estimula la digestión", "Alivia molestias", "Reduce inflamación intestinal", "Equilibra la flora"],
};

const SCHEDULES: Record<string, string> = {
  metabolismo: "Por la mañana en ayunas",
  ansiedad: "Tarde o antes de acontecimientos estresantes",
  liquidos: "Mañana y media tarde",
  digestivo: "Después de las comidas",
  quemar: "Antes del ejercicio o por la mañana",
  dormir: "30 minutos antes de acostarse",
  energetico: "Por la mañana o media tarde",
  detox: "En ayunas por la mañana",
  apetito: "20 minutos antes de las comidas",
  digestion: "Después de comer",
};

const WARNINGS: Record<string, string | undefined> = {
  metabolismo: "Evitar en embarazo y problemas cardíacos.",
  energetico: "Contiene cafeína. No consumir por la tarde-noche.",
  liquidos: "No prolongar más de 2 semanas seguidas.",
  quemar: "Consultar al médico si tomas medicación.",
  apetito: "No sustituye una alimentación equilibrada.",
};

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function generateRecipes(): Recipe[] {
  const recipes: Recipe[] = [];
  const difficulties: Difficulty[] = ["Fácil", "Fácil", "Fácil", "Media", "Media", "Avanzada"];

  CATEGORIES.forEach((cat) => {
    const herbs = HERBS[cat.id];
    const benefits = BENEFITS[cat.id];
    for (let i = 0; i < 10; i++) {
      const main = herbs[i % herbs.length];
      const second = herbs[(i + 2) % herbs.length];
      const third = herbs[(i + 5) % herbs.length];
      const baseNames = [
        `Té de ${main} con ${second}`,
        `Infusión de ${main} y ${third}`,
        `${main.charAt(0).toUpperCase() + main.slice(1)} con limón`,
        `Mezcla de ${main}, ${second} y ${third}`,
        `${main.charAt(0).toUpperCase() + main.slice(1)} dorado`,
        `Té clásico de ${main}`,
        `${main.charAt(0).toUpperCase() + main.slice(1)} con miel`,
        `Bebida de ${main} y jengibre`,
        `${main.charAt(0).toUpperCase() + main.slice(1)} especiado`,
        `Infusión calmante de ${main}`,
      ];
      recipes.push({
        id: `${cat.id}-${i + 1}`,
        name: baseNames[i],
        category: cat.id,
        emoji: cat.emoji,
        ingredients: [
          `1 cucharadita de ${main}`,
          `1 cucharadita de ${second}`,
          `1 taza de agua filtrada (250 ml)`,
          i % 2 === 0 ? "1 rodaja de limón" : "1 cucharadita de miel cruda (opcional)",
          i % 3 === 0 ? `Una pizca de ${third}` : "Endulzante natural al gusto",
        ],
        preparation: [
          "Hierve el agua en una olla limpia.",
          `Añade el ${main} y deja reposar 5 minutos fuera del fuego.`,
          `Incorpora el ${second} y tapa para conservar los aceites esenciales.`,
          "Cuela en una taza y agrega los extras al gusto.",
          "Bebe tibio para potenciar sus beneficios.",
        ],
        benefits: [pick(benefits, i), pick(benefits, i + 1), pick(benefits, i + 2)],
        schedule: SCHEDULES[cat.id],
        time: `${5 + (i % 4) * 2} min`,
        difficulty: difficulties[i % difficulties.length],
        warning: i % 3 === 0 ? WARNINGS[cat.id] : undefined,
      });
    }
  });
  return recipes;
}

export const RECIPES: Recipe[] = generateRecipes();

export function getRecipe(id: string) {
  return RECIPES.find((r) => r.id === id);
}

export function getCategory(id: string) {
  return CATEGORIES.find((c) => c.id === id);
}
