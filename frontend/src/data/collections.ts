export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  color: string;
  productCount: number;
}

export const collections: Collection[] = [
  {
    id: 'atlas',
    name: 'Atlas',
    slug: 'atlas',
    description: 'Colección elegante con tonos naturales y acabados mate.',
    image: 'linear-gradient(135deg, #D4A574 0%, #8B7355 100%)',
    color: '#D4A574',
    productCount: 12,
  },
  {
    id: 'calacatta',
    name: 'Calacatta',
    slug: 'calacatta',
    description: 'Inspirada en el mármol de Carrara, blanco con vetas grises.',
    image: 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)',
    color: '#F5F5F5',
    productCount: 10,
  },
  {
    id: 'terra',
    name: 'Terra',
    slug: 'terra',
    description: 'Colección rustica con texturas naturales y colores cálidos.',
    image: 'linear-gradient(135deg, #C17851 0%, #8B5A3C 100%)',
    color: '#C17851',
    productCount: 11,
  },
  {
    id: 'nordica',
    name: 'Nórdica',
    slug: 'nordica',
    description: 'Diseño escandinavo con colores fríos y líneas minimalistas.',
    image: 'linear-gradient(135deg, #E8E8E8 0%, #A8A8A8 100%)',
    color: '#D0D0D0',
    productCount: 9,
  },
  {
    id: 'botanica',
    name: 'Botánica',
    slug: 'botanica',
    description: 'Patrones inspirados en la naturaleza con tonos verdes.',
    image: 'linear-gradient(135deg, #8FB48F 0%, #5D7E5D 100%)',
    color: '#8FB48F',
    productCount: 8,
  },
];
