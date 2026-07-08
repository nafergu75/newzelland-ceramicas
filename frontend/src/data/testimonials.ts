export interface Testimonial {
  id: string;
  author: string;
  company?: string;
  text: string;
  rating: number;
  image?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 'test-001',
    author: 'María García',
    company: 'Reforma Cocinas Barcelona',
    text: 'Excelente calidad en los azulejos. Los clientes quedan maravillados con el acabado. Muy recomendado.',
    rating: 5,
  },
  {
    id: 'test-002',
    author: 'Juan Rodríguez',
    company: 'JR Construcciones',
    text: 'Precios competitivos y entrega rápida. El catálogo Calacatta es simplemente perfecto para proyectos de lujo.',
    rating: 5,
  },
  {
    id: 'test-003',
    author: 'Sandra López',
    company: 'Estudio Diseño Interior',
    text: 'La variedad de colecciones es increíble. Desde rustico hasta minimalista, todo en un lugar.',
    rating: 5,
  },
  {
    id: 'test-004',
    author: 'Carlos Moreno',
    company: 'Tienda de Cerámica Local',
    text: 'Distribuidor de confianza. Trato profesional y excelente servicio post-venta.',
    rating: 5,
  },
  {
    id: 'test-005',
    author: 'Elena Díaz',
    company: 'Proyectos Hogar España',
    text: 'Calidad premium a precio justo. Ya hemos realizado 15 proyectos juntos.',
    rating: 5,
  },
];
