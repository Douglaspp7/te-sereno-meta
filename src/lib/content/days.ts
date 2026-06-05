export type MacroData = {
  p: number;
  c: number;
  f: number;
};

export type RecipeDef = {
  id: string;
  name: string;
  label: string;
  kcal: number;
  macros: MacroData;
  ingredients: string[];
  instructions: string[];
  image: string;
};

export type ExerciseDef = {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  kcalBurn: number;
  level: string;
  videoUrl?: string; // We can use an unsplash placeholder or real video
};

export type DayContent = {
  dayNumber: number;
  mission: string;
  waterGlasses: number;
  breakfast: RecipeDef;
  lunch: RecipeDef;
  dinner: RecipeDef;
  exercise: ExerciseDef;
  motivation: string;
};

export const programDays: Record<number, DayContent> = {
  1: {
    dayNumber: 1,
    mission: "🚫 Hoy no tomes refrescos",
    waterGlasses: 8,
    motivation: "El primer paso siempre es el más difícil. Estás construyendo la disciplina que te dará resultados.",
    exercise: {
      id: "ex_d1",
      title: "Caminar 20 minutos",
      description: "A paso ligero. Ideal para activar el metabolismo sin forzar las articulaciones.",
      durationMin: 20,
      kcalBurn: 120,
      level: "Principiante",
      videoUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070",
    },
    breakfast: {
      id: "bf_d1",
      name: "Avena con frutos rojos",
      label: "Desayuno",
      kcal: 280,
      macros: { p: 10, c: 45, f: 8 },
      ingredients: ["40g de avena", "100ml de leche de almendras", "1 puñado de frutos rojos", "Canela al gusto"],
      instructions: ["Calentar la leche.", "Añadir la avena y cocinar a fuego lento 5 min.", "Servir con frutos rojos y canela."],
      image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=2076",
    },
    lunch: {
      id: "lu_d1",
      name: "Pollo a la plancha con quinoa",
      label: "Almuerzo",
      kcal: 420,
      macros: { p: 40, c: 45, f: 12 },
      ingredients: ["150g de pechuga de pollo", "50g de quinoa (peso en crudo)", "Ensalada mixta", "1 cda de aceite de oliva"],
      instructions: ["Hacer el pollo a la plancha.", "Hervir la quinoa por 15 min.", "Servir con la ensalada y el aceite crudo."],
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080",
    },
    dinner: {
      id: "dn_d1",
      name: "Salmón al horno con espárragos",
      label: "Cena",
      kcal: 350,
      macros: { p: 35, c: 10, f: 18 },
      ingredients: ["150g de salmón", "1 manojo de espárragos", "Medio limón", "Sal y pimienta"],
      instructions: ["Precalentar el horno a 200°C.", "Hornear salmón y espárragos por 15-20 min.", "Añadir jugo de limón al sacar."],
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=2187",
    }
  },
  2: {
    dayNumber: 2,
    mission: "💧 Beber 1 vaso de agua al despertar",
    waterGlasses: 8,
    motivation: "Un día a la vez. Ya superaste la emoción del primer día, hoy empieza la consistencia.",
    exercise: {
      id: "ex_d2",
      title: "Yoga Básico",
      description: "Rutina de estiramientos para mejorar flexibilidad y reducir el estrés.",
      durationMin: 15,
      kcalBurn: 80,
      level: "Principiante",
      videoUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2120",
    },
    breakfast: {
      id: "bf_d2",
      name: "Huevos revueltos con espinacas",
      label: "Desayuno",
      kcal: 250,
      macros: { p: 18, c: 5, f: 15 },
      ingredients: ["2 huevos", "1 puñado grande de espinacas", "1 tostada integral"],
      instructions: ["Saltear espinacas brevemente.", "Añadir huevos batidos.", "Servir con la tostada."],
      image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=2080",
    },
    lunch: {
      id: "lu_d2",
      name: "Ensalada de Atún",
      label: "Almuerzo",
      kcal: 380,
      macros: { p: 30, c: 20, f: 15 },
      ingredients: ["1 lata de atún al natural", "Lechuga y tomate", "1/2 aguacate", "Limón"],
      instructions: ["Mezclar todos los ingredientes.", "Aliñar con limón y sal."],
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070",
    },
    dinner: {
      id: "dn_d2",
      name: "Sopa de verduras y pollo",
      label: "Cena",
      kcal: 290,
      macros: { p: 25, c: 30, f: 8 },
      ingredients: ["100g de pollo desmenuzado", "Caldo casero", "Zanahoria, apio, calabacín"],
      instructions: ["Hervir verduras en el caldo.", "Añadir el pollo desmenuzado.", "Servir caliente."],
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071",
    }
  }
};

export function getDayContent(day: number): DayContent {
  // Retorna el día solicitado, o el día 1 si no existe (para evitar errores en días > 2 por ahora)
  return programDays[day] || programDays[1];
}
