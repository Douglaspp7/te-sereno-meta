export type TeaCategory = 'Energía' | 'Digestión' | 'Relajación' | 'Bienestar';

export interface TeaRecipe {
  day: number;
  imageUrl?: string;
  name: string;
  category: TeaCategory;
  shortDescription: string;
  benefits: string[];
  recommendedTime: string;
  difficulty: 'Fácil' | 'Media' | 'Premium';
  prepTime: string;
  ingredients: string[];
  instructions: string[];
  tipOfTheDay: string;
}

export const teas: TeaRecipe[] = [
  {
    day: 1,
    imageUrl: '/images/teas/t_verde_con_limn.png',
    name: "Té Verde con Limón",
    category: "Energía",
    shortDescription: "Apoio ao bem-estar diário e energia natural.",
    benefits: ["Sensación de bienestar", "Hidratación", "Energía", "Antioxidante"],
    recommendedTime: "08:00 - 10:00",
    difficulty: "Fácil",
    prepTime: "5 min",
    ingredients: [
      "1 taza de agua purificada",
      "1 cucharadita de hojas de té verde (ou 1 saquinho)",
      "1 rodaja de limón fresco",
      "Opcional: 1 cucharadita de miel cruda"
    ],
    instructions: [
      "Calentar el agua hasta que comience a hervir.",
      "Apagar el fuego y esperar 30 segundos para no quemar las hojas.",
      "Agregar el té verde y dejar infusionar entre 2 a 3 minutos.",
      "Añadir la rodaja de limón fresco a la taza caliente.",
      "Servir caliente, inhalar el aroma y disfrutar lentamente."
    ],
    tipOfTheDay: "Consumir este té durante la mañana puede ayudarte a crear una rutina saludable y consciente para despertar tu metabolismo."
  },
  {
    day: 2,
    imageUrl: '/images/teas/t_de_canela.png',
    name: "Té de Canela",
    category: "Digestión",
    shortDescription: "Toque dulce y especiado para reconfortar tu tarde.",
    benefits: ["Digestión", "Confort", "Equilibrio", "Bienestar general"],
    recommendedTime: "15:00 - 17:00",
    difficulty: "Fácil",
    prepTime: "10 min",
    ingredients: [
      "1 taza de agua",
      "1 rama de canela entera",
      "Opcional: un toque de manzana deshidratada"
    ],
    instructions: [
      "Hervir el agua en una olla pequeña.",
      "Añadir la rama de canela en el agua hirviendo.",
      "Bajar el fuego y dejar hervir a fuego lento por 5 minutos.",
      "Apagar y dejar reposar 3 minutos más.",
      "Servir caliente. Respira profundo antes del primer sorbo."
    ],
    tipOfTheDay: "La canela es perfecta para equilibrar los antojos de dulces durante la tarde."
  },
  {
    day: 3,
    imageUrl: '/images/teas/t_de_hibisco.png',
    name: "Té de Hibisco",
    category: "Bienestar",
    shortDescription: "Fresco, vibrante y lleno de antioxidantes.",
    benefits: ["Hidratación", "Circulación", "Refrescante", "Antioxidante"],
    recommendedTime: "10:00 - 12:00",
    difficulty: "Fácil",
    prepTime: "7 min",
    ingredients: [
      "1 taza de agua",
      "1 cucharada de flores secas de hibisco (flor de jamaica)"
    ],
    instructions: [
      "Calentar el agua sin dejar que hierva a borbotones.",
      "Añadir las flores de hibisco.",
      "Dejar infusionar por unos 5 a 7 minutos hasta que el agua esté intensamente roja.",
      "Colar la mezcla hacia tu taza favorita.",
      "Puede disfrutarse tanto caliente como frío con hielo."
    ],
    tipOfTheDay: "El color rojo brillante no solo es hermoso, sino un indicativo de su alto poder hidratante y antioxidante."
  },
  {
    day: 4,
    imageUrl: '/images/teas/t_de_jengibre.png',
    name: "Té de Jengibre",
    category: "Digestión",
    shortDescription: "Un abrazo cálido y digestivo para tu estómago.",
    benefits: ["Digestión", "Inmunidad", "Calidez", "Metabolismo"],
    recommendedTime: "Después de las comidas",
    difficulty: "Fácil",
    prepTime: "10 min",
    ingredients: [
      "1 taza de agua",
      "2-3 rodajas de jengibre fresco pelado",
      "1 toque de jugo de limón"
    ],
    instructions: [
      "Pelar el jengibre fresco y cortar 3 rebanadas delgadas.",
      "Poner a hervir el agua junto con las rodajas de jengibre.",
      "Reducir a fuego lento por 5 minutos para extraer todo su sabor.",
      "Retirar del fuego y servir en una taza.",
      "Añadir unas gotas de limón y beber en sorbos lentos."
    ],
    tipOfTheDay: "Excelente opción para cuando te sientas hinchado o necesites un reinicio estomacal rápido."
  },
  {
    day: 5,
    imageUrl: '/images/teas/t_de_menta.png',
    name: "Té de Menta",
    category: "Digestión",
    shortDescription: "Frescura pura para aliviar la mente y el cuerpo.",
    benefits: ["Fresco", "Digestión", "Claridad mental", "Relajación muscular"],
    recommendedTime: "14:00 - 16:00",
    difficulty: "Fácil",
    prepTime: "5 min",
    ingredients: [
      "1 taza de agua",
      "Un puñado de hojas de menta fresca"
    ],
    instructions: [
      "Lavar muy bien las hojas de menta fresca.",
      "Llevar el agua a punto de ebullición y retirarla del calor.",
      "Añadir la menta y tapar la taza para atrapar los aceites esenciales.",
      "Dejar infusionar por 5 minutos.",
      "Destapar, disfrutar el aroma refrescante y beber."
    ],
    tipOfTheDay: "Puedes triturar ligeramente las hojas en tus manos antes de ponerlas en el agua para liberar más aroma."
  },
  {
    day: 6,
    imageUrl: '/images/teas/t_de_manzanilla.png',
    name: "Té de Manzanilla",
    category: "Relajación",
    shortDescription: "Un clásico suave para calmar y preparar el descanso.",
    benefits: ["Relajación", "Calma", "Sueño profundo", "Paz interior"],
    recommendedTime: "20:00 - 22:00",
    difficulty: "Fácil",
    prepTime: "6 min",
    ingredients: [
      "1 taza de agua caliente",
      "1 cucharada de flores secas de manzanilla"
    ],
    instructions: [
      "Calentar el agua hasta que hierva.",
      "Apagar el fuego y colocar las flores de manzanilla.",
      "Tapar herméticamente la taza o tetera.",
      "Dejar reposar 5 minutos exactos para no amargar la bebida.",
      "Colar y disfrutar en un lugar silencioso antes de dormir."
    ],
    tipOfTheDay: "Desconecta las pantallas de tu celular al menos 30 minutos después de tomar este té para maximizar su efecto."
  },
  {
    day: 7,
    imageUrl: '/images/teas/t_de_lavanda.png',
    name: "Té de Lavanda",
    category: "Relajación",
    shortDescription: "Aroma floral para calmar profundamente la ansiedad.",
    benefits: ["Relajación", "Reducción de estrés", "Sueño profundo", "Armonía"],
    recommendedTime: "Antes de dormir",
    difficulty: "Fácil",
    prepTime: "8 min",
    ingredients: [
      "1 taza de agua",
      "1/2 cucharadita de flores secas de lavanda (grado culinario)"
    ],
    instructions: [
      "Llevar el agua a fuego y calentar sin que hierva fuerte.",
      "Añadir la lavanda cuidadosamente.",
      "Tapar y dejar reposar 4 minutos.",
      "Colar usando un filtro fino.",
      "Sentir cómo su aroma tranquiliza inmediatamente los sentidos."
    ],
    tipOfTheDay: "Asegúrate de usar siempre lavanda culinaria, es más dulce y segura para infusiones."
  },
  {
    day: 8,
    imageUrl: '/images/teas/t_de_rooibos.png',
    name: "Té de Rooibos",
    category: "Bienestar",
    shortDescription: "Una infusión libre de cafeína pero llena de color y sabor.",
    benefits: ["Antioxidante", "Sin cafeína", "Piel sana", "Hidratación"],
    recommendedTime: "Cualquier hora",
    difficulty: "Fácil",
    prepTime: "6 min",
    ingredients: [
      "1 taza de agua",
      "1 cucharadita de rooibos puro"
    ],
    instructions: [
      "Calentar el agua a ebullición completa.",
      "Agregar el rooibos y tapar la infusión.",
      "Esperar unos 5 minutos hasta que tome un tono rojizo oscuro.",
      "Colar, no necesita endulzante ya que tiene un toque natural dulce.",
      "Tomarlo tranquilamente disfrutando su sabor terroso."
    ],
    tipOfTheDay: "El rooibos es excelente para tomar incluso de noche, ya que no alterará tu ciclo de sueño."
  },
  {
    day: 9,
    imageUrl: '/images/teas/t_matcha_premium.png',
    name: "Té Matcha Premium",
    category: "Energía",
    shortDescription: "La concentración más pura y poderosa de la hoja del té.",
    benefits: ["Metabolismo", "Energía sostenida", "Foco mental", "Antioxidante premium"],
    recommendedTime: "07:00 - 09:00",
    difficulty: "Media",
    prepTime: "3 min",
    ingredients: [
      "1/2 taza de agua caliente (no hirviendo)",
      "1 cucharadita (bambú) de té matcha en polvo puro",
      "Opcional: Leche vegetal espumada"
    ],
    instructions: [
      "Calentar el agua pero retirarla antes de que hierva (80°C).",
      "Poner el polvo de matcha en el fondo de un tazón ancho.",
      "Agregar un chorrito del agua caliente y batir vigorosamente en forma de 'W' o 'M'.",
      "Una vez sin grumos y con espuma, agregar el resto del agua.",
      "Servir inmediatamente y experimentar su intenso color verde."
    ],
    tipOfTheDay: "No uses agua hirviendo, ya que esto quema el polvo de matcha y lo hace muy amargo."
  },
  {
    day: 10,
    imageUrl: '/images/teas/t_de_crcuma_y_pimienta.png',
    name: "Té de Cúrcuma y Pimienta",
    category: "Bienestar",
    shortDescription: "Un antiinflamatorio natural con un toque dorado intenso.",
    benefits: ["Antiinflamatorio", "Inmunidad", "Calidez", "Recuperación"],
    recommendedTime: "Mañana o tarde",
    difficulty: "Fácil",
    prepTime: "10 min",
    ingredients: [
      "1 taza de agua",
      "1/2 cucharadita de cúrcuma en polvo o rallada",
      "Una pizca de pimienta negra"
    ],
    instructions: [
      "Hervir el agua.",
      "Agregar la cúrcuma y la pizca esencial de pimienta negra.",
      "Hervir a fuego lento por 5 a 10 minutos.",
      "Colar en una taza.",
      "Disfrutar este abrazo cálido y sanador."
    ],
    tipOfTheDay: "La pimienta negra es el secreto mágico que activa la absorción de los beneficios de la cúrcuma en tu cuerpo."
  },
  {
    day: 11,
    imageUrl: '/images/teas/t_chai_especiado.png',
    name: "Té Chai Especiado",
    category: "Energía",
    shortDescription: "Mezcla de especias vibrantes para despertar el alma.",
    benefits: ["Energía", "Digestión", "Calidez", "Foco mental"],
    recommendedTime: "09:00 - 11:00",
    difficulty: "Media",
    prepTime: "15 min",
    ingredients: [
      "1 taza de agua",
      "Cardamomo, clavos de olor y canela",
      "1 cucharadita de té negro"
    ],
    instructions: [
      "Triturar ligeramente las especias en un mortero.",
      "Llevar a ebullición junto con el agua por 10 minutos.",
      "Bajar el fuego, añadir el té negro y dejar 3 minutos más.",
      "Colar cuidadosamente sirviendo en una taza.",
      "Ideal para tomar mientras planificas tu día."
    ],
    tipOfTheDay: "Hervir las especias primero asegura que liberen todo su sabor antes de que el té negro amargue la mezcla."
  },
  {
    day: 12,
    imageUrl: '/images/teas/infusin_de_romero.png',
    name: "Infusión de Romero",
    category: "Bienestar",
    shortDescription: "Aroma de pinar para estimular la memoria y el bienestar.",
    benefits: ["Memoria", "Digestión", "Estimulante", "Refrescante"],
    recommendedTime: "10:00 - 12:00",
    difficulty: "Fácil",
    prepTime: "6 min",
    ingredients: [
      "1 taza de agua",
      "1 ramita pequeña de romero fresco"
    ],
    instructions: [
      "Calentar agua hasta su punto de hervor.",
      "Lavar la ramita de romero y sumergirla.",
      "Tapar y dejar reposar 5 minutos.",
      "Retirar la rama.",
      "Beber en pequeños sorbos notando su aroma a bosque."
    ],
    tipOfTheDay: "El romero se ha utilizado históricamente para ayudar a la claridad mental; es el té perfecto para estudiar o trabajar."
  },
  {
    day: 13,
    imageUrl: '/images/teas/t_oolong.png',
    name: "Té Oolong",
    category: "Digestión",
    shortDescription: "Té azul semi-oxidado, suave y sofisticado.",
    benefits: ["Digestión lenta", "Metabolismo", "Sensación ligera", "Antioxidante"],
    recommendedTime: "Después de almuerzo",
    difficulty: "Media",
    prepTime: "5 min",
    ingredients: [
      "1 taza de agua (a 90°C)",
      "1 cucharadita de hojas de té Oolong"
    ],
    instructions: [
      "Hervir el agua y dejarla enfriar un minuto.",
      "Colocar las hojas enteras enrolladas de Oolong.",
      "Dejar infusionar por 3-4 minutos (las hojas se abrirán espectacularmente).",
      "Colar en tu taza.",
      "Siente su sabor entre el verde y el negro."
    ],
    tipOfTheDay: "Las hojas de Oolong de buena calidad se pueden reinfusionar hasta 3 veces en un mismo día."
  },
  {
    day: 14,
    imageUrl: '/images/teas/t_de_frutos_rojos_silvestres.png',
    name: "Té de Frutos Rojos Silvestres",
    category: "Bienestar",
    shortDescription: "Vibrante, afrutado y lleno de vitamina C.",
    benefits: ["Inmunidad", "Antioxidante", "Refrescante", "Sin cafeína"],
    recommendedTime: "16:00 - 18:00",
    difficulty: "Fácil",
    prepTime: "8 min",
    ingredients: [
      "1 taza de agua",
      "1 cucharada de mezcla seca de frutos rojos (frambuesa, mora, fresa)"
    ],
    instructions: [
      "Hervir agua en una olla.",
      "Agregar la mezcla de frutos secos.",
      "Dejar hervir suavemente por 2 minutos.",
      "Apagar, tapar y esperar 5 minutos más.",
      "Beber tibio o caliente, disfrutando de cada nota afrutada."
    ],
    tipOfTheDay: "Al terminar el té, ¡no tires los frutos hidratados del fondo! Puedes comerlos y aprovechar su fibra."
  },
  {
    day: 15,
    imageUrl: '/images/teas/infusin_de_manzana_y_canela.png',
    name: "Infusión de Manzana y Canela",
    category: "Relajación",
    shortDescription: "Como un postre cálido y reconfortante hecho bebida.",
    benefits: ["Relajación", "Confort", "Saciante", "Dulzor natural"],
    recommendedTime: "Cena",
    difficulty: "Fácil",
    prepTime: "12 min",
    ingredients: [
      "1 taza de agua",
      "1/2 manzana picada (con cáscara)",
      "1 ramita de canela"
    ],
    instructions: [
      "Colocar el agua, la manzana picada y la canela a hervir.",
      "Dejar cocinar a fuego lento por 10 minutos para que la manzana suelte el dulzor.",
      "Retirar del fuego y servir la infusión.",
      "Disfrutar de esta deliciosa bebida reconfortante."
    ],
    tipOfTheDay: "Ideal para esos momentos en los que apetece un postre antes de dormir, pero sin las calorías vacías."
  },
  {
    day: 16,
    imageUrl: '/images/teas/t_blanco_imperial.png',
    name: "Té Blanco Imperial",
    category: "Bienestar",
    shortDescription: "El té menos procesado, con notas florales y delicadas.",
    benefits: ["Antioxidante máximo", "Piel sana", "Hidratación", "Suavidad"],
    recommendedTime: "Mañana",
    difficulty: "Media",
    prepTime: "5 min",
    ingredients: [
      "1 taza de agua",
      "1 cucharadita de brotes de té blanco"
    ],
    instructions: [
      "Llevar el agua a 80°C (nunca hirviendo fuertemente).",
      "Servir sobre los delicados brotes de té blanco.",
      "Dejar reposar entre 4 y 5 minutos.",
      "Sentir la delicadeza del aroma floral.",
      "Beber con calma para apreciar sus matices sutiles."
    ],
    tipOfTheDay: "Al ser el té menos procesado, contiene las tasas más altas de antioxidantes protectores celulares."
  },
  {
    day: 17,
    imageUrl: '/images/teas/t_de_toronjil_melissa.png',
    name: "Té de Toronjil (Melissa)",
    category: "Relajación",
    shortDescription: "Dulce sabor a limón suave para apagar el estrés.",
    benefits: ["Relajación profunda", "Calma", "Mejora del humor", "Antiestrés"],
    recommendedTime: "20:00 - 22:00",
    difficulty: "Fácil",
    prepTime: "7 min",
    ingredients: [
      "1 taza de agua caliente",
      "1 cucharada de toronjil o melisa seco"
    ],
    instructions: [
      "Apagar el agua justo al hervir.",
      "Colocar la melisa en la taza y añadir el agua.",
      "Tapar rápidamente (sus aceites esenciales se evaporan fácil).",
      "Reposar 5 minutos.",
      "Disfrutar su sutil sabor anisado y limonado."
    ],
    tipOfTheDay: "Esta planta ha sido históricamente conocida como la 'planta de la alegría' por su efecto para calmar ansiedades."
  },
  {
    day: 18,
    imageUrl: '/images/teas/t_de_moringa.png',
    name: "Té de Moringa",
    category: "Energía",
    shortDescription: "Un superalimento en infusión, denso en nutrientes.",
    benefits: ["Energía", "Inmunidad", "Vitaminas", "Nutrición natural"],
    recommendedTime: "Mañana",
    difficulty: "Fácil",
    prepTime: "6 min",
    ingredients: [
      "1 taza de agua",
      "1 cucharadita de hojas secas de moringa"
    ],
    instructions: [
      "Llevar el agua a punto de ebullición y retirarla.",
      "Añadir la moringa y dejar reposar 5 minutos.",
      "Colar en una taza.",
      "Su color será intensamente verde terroso.",
      "Beber y sentir la nutrición pura de sus hojas."
    ],
    tipOfTheDay: "La moringa aporta una cantidad enorme de vitaminas y hierro; un excelente complemento al desayuno."
  },
  {
    day: 19,
    imageUrl: '/images/teas/t_pu-erh_t_rojo.png',
    name: "Té Pu-erh (Té Rojo)",
    category: "Digestión",
    shortDescription: "Té fermentado y maduro con aroma a tierra húmeda.",
    benefits: ["Digestión pesada", "Metabolismo", "Purificador", "Equilibrio"],
    recommendedTime: "Después de comidas fuertes",
    difficulty: "Premium",
    prepTime: "5 min",
    ingredients: [
      "1 taza de agua hirviendo",
      "1 cucharadita de té Pu-erh"
    ],
    instructions: [
      "Hacer un enjuague rápido (verter un poco de agua hirviendo y botarla) a las hojas.",
      "Añadir la taza entera de agua hirviendo.",
      "Infusionar 3 a 4 minutos.",
      "Servir este té oscuro y profundo.",
      "Tomar caliente."
    ],
    tipOfTheDay: "El sabor a tierra mojada es señal de un excelente proceso de maduración y fermentación natural."
  },
  {
    day: 20,
    imageUrl: '/images/teas/agua_con_limn_y_chia.png',
    name: "Agua con Limón y Chia",
    category: "Bienestar",
    shortDescription: "Un cóctel de fibra soluble e hidratación profunda.",
    benefits: ["Hidratación", "Fibra", "Saciante", "Limpieza"],
    recommendedTime: "Despertar (Ayuno)",
    difficulty: "Fácil",
    prepTime: "15 min",
    ingredients: [
      "1 taza de agua tibia o fría",
      "El jugo de medio limón",
      "1 cucharada de semillas de chía"
    ],
    instructions: [
      "En un vaso, mezclar el agua con la cucharada de chía.",
      "Revolver vigorosamente y dejar reposar por 15 minutos (se volverá gelatinoso).",
      "Añadir el jugo de limón fresco.",
      "Revolver nuevamente.",
      "Beber y masticar levemente las semillas."
    ],
    tipOfTheDay: "Las semillas de chía absorben hasta 10 veces su peso en agua, ayudándote a permanecer hidratado por horas."
  },
  {
    day: 21,
    imageUrl: '/images/teas/mezcla_especial_mireto21.png',
    name: "Mezcla Especial MiReto21",
    category: "Energía",
    shortDescription: "La celebración dorada de tu triunfo tras 21 días.",
    benefits: ["Celebración", "Energía máxima", "Metabolismo", "Inmunidad suprema"],
    recommendedTime: "Por la mañana",
    difficulty: "Premium",
    prepTime: "10 min",
    ingredients: [
      "1 taza de agua",
      "1/2 cucharadita de té verde",
      "Rodajas de jengibre fresco",
      "Pizca de cúrcuma",
      "Gotas de limón"
    ],
    instructions: [
      "Hervir el agua con las rodajas de jengibre y la cúrcuma por 5 minutos.",
      "Apagar el fuego y añadir las hojas de té verde.",
      "Tapar y esperar 3 minutos exactos.",
      "Colar en una taza festiva y agregar limón.",
      "Sentarte orgullosamente, brindar por tu progreso y beber."
    ],
    tipOfTheDay: "¡Has creado un hábito hermoso de hidratación premium! ¡Siéntete orgulloso y nunca lo abandones!"
  }
];
