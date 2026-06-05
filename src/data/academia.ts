export type AcademiaCategory = 'Nutrición' | 'Hábitos' | 'Bienestar' | 'Actividad Física' | 'Guías Especiales';

export interface AcademiaDocument {
  id: string;
  title: string;
  description: string;
  category: AcademiaCategory;
  pages: number;
  readTime: string;
  pdfUrl: string;
  coverImage: string;
}

export const academiaDocuments: AcademiaDocument[] = [
  {
    id: "doc_recetario_saludable",
    title: "Recetario Saludable",
    description: "Aprende a preparar comidas saludables, deliciosas y fáciles para el día a día sin pasar horas en la cocina.",
    category: "Nutrición",
    pages: 25,
    readTime: "15 min",
    pdfUrl: "/pdfs/531961951-Recetario-saludable.pdf",
    coverImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "doc_cenas_rapidas",
    title: "Cenas Rápidas y Saludables",
    description: "Ideas prácticas y ligeras para terminar el día con una buena nutrición sin sacrificar tu tiempo de descanso.",
    category: "Nutrición",
    pages: 32,
    readTime: "20 min",
    pdfUrl: "/pdfs/624605130-E-book-Cenas-Rapidas-y-Saludables.pdf",
    coverImage: "https://images.unsplash.com/photo-1498837167922-41c53b4f0f14?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "doc_guia_alimentacion",
    title: "Guía Básica de Alimentación",
    description: "Descubre los pilares fundamentales para nutrir tu cuerpo, entender los macronutrientes y construir hábitos sostenibles.",
    category: "Hábitos",
    pages: 45,
    readTime: "30 min",
    pdfUrl: "/pdfs/681711360-GUIA-BASICA-DE-ALIMENTACION-SALUDABLE.pdf",
    coverImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "doc_tes_poder",
    title: "El Poder de los Tés",
    description: "Conoce las propiedades curativas, antioxidantes y relajantes de los mejores tés e infusiones naturales.",
    category: "Bienestar",
    pages: 18,
    readTime: "10 min",
    pdfUrl: "/pdfs/690700585-Tes.pdf",
    coverImage: "https://images.unsplash.com/photo-1576092762791-dd9e2220abd1?q=80&w=1000&auto=format&fit=crop"
  }
];
