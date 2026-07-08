# Newzelland Cerámicas Web Expansion Implementation Plan

> **For agentic workers:** RECOMMENDED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Newzelland Cerámicas' web presence into a professional, feature-rich platform with 50+ products, 7 complete pages, modern design system, and responsive UI.

**Architecture:** 
- Modular React component library with reusable UI components
- Comprehensive product database (50+ ceramics with categories/collections)
- Enhanced styling with gradient backgrounds, animations, and professional typography
- Complete navigation with semantic pages (Home, About, Collections, Contact, FAQ, Downloads, Products)
- Mobile-first responsive design using CSS Grid/Flexbox
- Type-safe TypeScript throughout

**Tech Stack:** React 18, TypeScript, React Router, Axios, CSS Grid/Flexbox, Vite

---

## File Structure

**New Components (reusable):**
- `src/components/Header.tsx` - Navigation header
- `src/components/Footer.tsx` - Footer with links
- `src/components/ProductCard.tsx` - Product card component
- `src/components/HeroSection.tsx` - Hero banner with CTA
- `src/components/Testimonials.tsx` - Customer reviews carousel
- `src/components/ContactForm.tsx` - Contact form component
- `src/components/Newsletter.tsx` - Newsletter signup

**New Pages:**
- `src/pages/AboutPage.tsx` - Company history & values
- `src/pages/CollectionsPage.tsx` - Product collections browser
- `src/pages/ProductDetailPage.tsx` - Individual product detail
- `src/pages/ContactPage.tsx` - Contact form & info
- `src/pages/FAQPage.tsx` - Frequently asked questions
- `src/pages/DownloadsPage.tsx` - PDF catalog downloads
- Enhanced `src/pages/HomePage.tsx` - Improved home with hero

**Data & Services:**
- `src/data/products.ts` - 50+ product database
- `src/data/collections.ts` - Product collections/categories
- `src/data/testimonials.ts` - Customer testimonials
- `src/data/faq.ts` - FAQ content
- `src/services/products.ts` - Product service methods

**Styling:**
- `src/styles/variables.css` - Color palette & design tokens
- `src/styles/globals.css` - Global responsive styles
- `src/styles/components.css` - Component styles
- `src/styles/animations.css` - Animations & transitions
- Enhanced `src/index.css` - Base styles with ceramic theme

**Routing & App:**
- Enhanced `src/App.tsx` - New routes added

---

## Task Breakdown

### Task 1: Create Design System & Global Styles

**Files:**
- Create: `src/styles/variables.css`
- Create: `src/styles/globals.css`
- Create: `src/styles/animations.css`
- Modify: `src/index.css`

- [ ] **Step 1: Create CSS variables for ceramic theme**

Create `src/styles/variables.css`:
```css
:root {
  /* Primary Colors - Ceramic & Earth Tones */
  --color-primary: #8B7355;      /* Warm ceramic brown */
  --color-primary-light: #D4A574;
  --color-primary-dark: #5C4A3A;
  
  /* Secondary Colors */
  --color-secondary: #E8D4C4;    /* Cream/ivory */
  --color-accent: #C17851;       /* Clay/burnt sienna */
  --color-accent-dark: #8B5A3C;
  
  /* Neutrals */
  --color-white: #FFFFFF;
  --color-black: #1A1A1A;
  --color-gray-50: #F9F7F4;
  --color-gray-100: #F2EFEB;
  --color-gray-200: #E8E3DC;
  --color-gray-300: #D9D0C4;
  --color-gray-400: #B8ADA0;
  --color-gray-500: #8B8078;
  --color-gray-600: #6B6159;
  --color-gray-700: #4A443B;
  
  /* Semantic Colors */
  --color-success: #4CAF50;
  --color-warning: #FF9800;
  --color-error: #F44336;
  --color-info: #2196F3;
  
  /* Typography */
  --font-sans: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  --font-serif: Georgia, 'Times New Roman', serif;
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 2.5rem;
  --spacing-3xl: 3rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* Border Radius */
  --radius-none: 0;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-white: #FFFFFF;
    --color-black: #1A1A1A;
    --color-gray-50: #1F1F1F;
    --color-gray-100: #2D2D2D;
    --color-gray-200: #3F3F3F;
    --color-gray-300: #505050;
    --color-gray-400: #707070;
    --color-gray-500: #909090;
    --color-gray-600: #B0B0B0;
    --color-gray-700: #EBEBEB;
  }
}
```

- [ ] **Step 2: Create global responsive styles**

Create `src/styles/globals.css`:
```css
/* Reset & Defaults */
html, body, #root {
  width: 100%;
  height: 100%;
}

body {
  font-family: var(--font-sans);
  background-color: var(--color-gray-50);
  color: var(--color-gray-700);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Responsive Typography */
h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  margin-bottom: var(--spacing-lg);
  color: var(--color-primary-dark);
}

h2 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: 1.3;
  margin-bottom: var(--spacing-lg);
  color: var(--color-primary-dark);
}

h3 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
  color: var(--color-primary);
}

h4, h5, h6 {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
}

p {
  margin-bottom: var(--spacing-md);
  color: var(--color-gray-600);
}

a {
  color: var(--color-accent);
  text-decoration: none;
  transition: color var(--transition-base);
}

a:hover {
  color: var(--color-accent-dark);
  text-decoration: underline;
}

/* Buttons */
button {
  font-family: var(--font-sans);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  background-color: var(--color-accent);
  color: white;
}

button:hover {
  background-color: var(--color-accent-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

button:active {
  transform: translateY(0);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button.secondary {
  background-color: var(--color-gray-200);
  color: var(--color-gray-700);
}

button.secondary:hover {
  background-color: var(--color-gray-300);
}

button.outline {
  background-color: transparent;
  border-color: var(--color-accent);
  color: var(--color-accent);
}

button.outline:hover {
  background-color: var(--color-accent);
  color: white;
}

/* Forms */
input, textarea, select {
  font-family: var(--font-sans);
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(193, 120, 81, 0.1);
}

textarea {
  resize: vertical;
  min-height: 120px;
}

label {
  display: block;
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-sm);
  color: var(--color-gray-700);
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

/* Grid Utilities */
.grid {
  display: grid;
  gap: var(--spacing-lg);
}

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

@media (max-width: 768px) {
  .grid-cols-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid-cols-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid-cols-2 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  
  h1 { font-size: var(--font-size-3xl); }
  h2 { font-size: var(--font-size-2xl); }
}

/* Flexbox Utilities */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-center { justify-content: center; align-items: center; }
.flex-between { justify-content: space-between; align-items: center; }
.flex-wrap { flex-wrap: wrap; }

/* Spacing Utilities */
.mt-1 { margin-top: var(--spacing-md); }
.mt-2 { margin-top: var(--spacing-lg); }
.mt-3 { margin-top: var(--spacing-2xl); }
.mb-1 { margin-bottom: var(--spacing-md); }
.mb-2 { margin-bottom: var(--spacing-lg); }
.mb-3 { margin-bottom: var(--spacing-2xl); }
.p-1 { padding: var(--spacing-md); }
.p-2 { padding: var(--spacing-lg); }
.p-3 { padding: var(--spacing-2xl); }

/* Text Utilities */
.text-center { text-align: center; }
.text-muted { color: var(--color-gray-500); }
.font-serif { font-family: var(--font-serif); }
```

- [ ] **Step 3: Create animations CSS**

Create `src/styles/animations.css`:
```css
/* Fade Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale Animations */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Glow Animations */
@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(193, 120, 81, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(193, 120, 81, 0.8);
  }
}

/* Utility Classes */
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.5s ease-out;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-slide-in-left {
  animation: slideInLeft 0.5s ease-out;
}

.animate-slide-in-right {
  animation: slideInRight 0.5s ease-out;
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}

/* Hover Effects */
.hover-lift {
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.hover-scale {
  transition: transform var(--transition-base);
}

.hover-scale:hover {
  transform: scale(1.05);
}
```

- [ ] **Step 4: Update index.css with new imports**

Modify `src/index.css`:
```css
@import './styles/variables.css';
@import './styles/globals.css';
@import './styles/animations.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
```

---

### Task 2: Create Product Data & Collections

**Files:**
- Create: `src/data/products.ts`
- Create: `src/data/collections.ts`
- Create: `src/data/testimonials.ts`
- Create: `src/data/faq.ts`

- [ ] **Step 1: Create collections data**

Create `src/data/collections.ts`:
```typescript
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
```

- [ ] **Step 2: Create comprehensive products data**

Create `src/data/products.ts`:
```typescript
export interface Product {
  id: string;
  name: string;
  collection: string;
  format: string;
  m2_per_box: number;
  price: number;
  color?: string;
  finish?: 'mate' | 'brillo' | 'satinado';
  description: string;
  specifications?: {
    thickness?: string;
    resistance?: string;
    waterproof?: boolean;
  };
}

export const products: Product[] = [
  // ATLAS Collection
  {
    id: 'atlas-001',
    name: 'Atlas Beige Natural',
    collection: 'atlas',
    format: '30x60cm',
    m2_per_box: 1.08,
    price: 45.00,
    color: '#D4A574',
    finish: 'mate',
    description: 'Azulejo cerámico con tonos beige naturales. Ideal para baños y cocinas modernas.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'atlas-002',
    name: 'Atlas Gris',
    collection: 'atlas',
    format: '60x60cm',
    m2_per_box: 1.0,
    price: 52.00,
    color: '#8B8078',
    finish: 'mate',
    description: 'Gran formato en tonos grises cálidos con aspecto mineral.',
    specifications: { thickness: '10mm', resistance: 'Clase 4', waterproof: true },
  },
  {
    id: 'atlas-003',
    name: 'Atlas Marrón Oscuro',
    collection: 'atlas',
    format: '45x45cm',
    m2_per_box: 1.23,
    price: 38.50,
    color: '#5C4A3A',
    finish: 'satinado',
    description: 'Tonos chocolates con acabado satinado. Elegancia y calidez.',
    specifications: { thickness: '9mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'atlas-004',
    name: 'Atlas Crema',
    collection: 'atlas',
    format: '30x30cm',
    m2_per_box: 1.08,
    price: 35.00,
    color: '#F5E6D3',
    finish: 'brillo',
    description: 'Azulejo pequeño con acabado brillante. Perfecto para combinaciones.',
    specifications: { thickness: '8mm', resistance: 'Clase 2', waterproof: true },
  },
  {
    id: 'atlas-005',
    name: 'Atlas Mosaico',
    collection: 'atlas',
    format: '30x30cm (mosaico)',
    m2_per_box: 0.9,
    price: 48.00,
    color: '#D4A574',
    finish: 'mate',
    description: 'Patrón de mosaico geométrico con múltiples tonos.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'atlas-006',
    name: 'Atlas Piedra',
    collection: 'atlas',
    format: '40x80cm',
    m2_per_box: 0.96,
    price: 55.00,
    color: '#A0927E',
    finish: 'mate',
    description: 'Imitación de piedra natural con textura relieve.',
    specifications: { thickness: '11mm', resistance: 'Clase 4', waterproof: true },
  },
  {
    id: 'atlas-007',
    name: 'Atlas Laminado',
    collection: 'atlas',
    format: '60x120cm',
    m2_per_box: 0.72,
    price: 68.00,
    color: '#C4B5A0',
    finish: 'brillo',
    description: 'Gran formato laminado. Aspecto pulido y moderno.',
    specifications: { thickness: '10mm', resistance: 'Clase 5', waterproof: true },
  },
  {
    id: 'atlas-008',
    name: 'Atlas Textura',
    collection: 'atlas',
    format: '45x45cm',
    m2_per_box: 1.23,
    price: 42.00,
    color: '#B8A89A',
    finish: 'mate',
    description: 'Acabado con textura relieve. Aspecto manual y artesanal.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'atlas-009',
    name: 'Atlas Borde Natural',
    collection: 'atlas',
    format: '30x60cm',
    m2_per_box: 1.08,
    price: 50.00,
    color: '#D4A574',
    finish: 'mate',
    description: 'Bordes naturales sin pulir. Efecto rústico y elegante.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'atlas-010',
    name: 'Atlas Composición',
    collection: 'atlas',
    format: 'Mix 30x60 + 60x60',
    m2_per_box: 1.04,
    price: 52.00,
    color: '#D4A574',
    finish: 'mate',
    description: 'Composición mixta con dos formatos complementarios.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'atlas-011',
    name: 'Atlas Piedra Gris',
    collection: 'atlas',
    format: '45x90cm',
    m2_per_box: 0.9,
    price: 58.00,
    color: '#9A8E84',
    finish: 'mate',
    description: 'Efecto piedra natural en formato rectangular alargado.',
    specifications: { thickness: '11mm', resistance: 'Clase 4', waterproof: true },
  },
  {
    id: 'atlas-012',
    name: 'Atlas Blanco Roto',
    collection: 'atlas',
    format: '30x30cm',
    m2_per_box: 1.08,
    price: 40.00,
    color: '#F3F0ED',
    finish: 'brillo',
    description: 'Blanco cálido con matices dorados. Luminosidad natural.',
    specifications: { thickness: '8mm', resistance: 'Clase 2', waterproof: true },
  },

  // CALACATTA Collection
  {
    id: 'calacatta-001',
    name: 'Calacatta Blanco',
    collection: 'calacatta',
    format: '60x120cm',
    m2_per_box: 0.72,
    price: 75.00,
    color: '#FFFFFF',
    finish: 'brillo',
    description: 'Mármol Calacatta Premium. Blanco puro con vetas grises sutiles.',
    specifications: { thickness: '11mm', resistance: 'Clase 5', waterproof: true },
  },
  {
    id: 'calacatta-002',
    name: 'Calacatta Gris Claro',
    collection: 'calacatta',
    format: '45x90cm',
    m2_per_box: 0.9,
    price: 65.00,
    color: '#E5E5E5',
    finish: 'brillo',
    description: 'Vetas grises delicadas sobre fondo blanco. Elegancia clásica.',
    specifications: { thickness: '10mm', resistance: 'Clase 4', waterproof: true },
  },
  {
    id: 'calacatta-003',
    name: 'Calacatta Veteado',
    collection: 'calacatta',
    format: '30x60cm',
    m2_per_box: 1.08,
    price: 55.00,
    color: '#F8F8F8',
    finish: 'brillo',
    description: 'Veteado natural prominente. Aspecto de mármol auténtico.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'calacatta-004',
    name: 'Calacatta Oscuro',
    collection: 'calacatta',
    format: '60x60cm',
    m2_per_box: 1.0,
    price: 62.00,
    color: '#D0D0D0',
    finish: 'satinado',
    description: 'Tonos grises más intensos. Acabado satinado sofisticado.',
    specifications: { thickness: '10mm', resistance: 'Clase 4', waterproof: true },
  },
  {
    id: 'calacatta-005',
    name: 'Calacatta Pulido',
    collection: 'calacatta',
    format: '30x30cm',
    m2_per_box: 1.08,
    price: 48.00,
    color: '#FCFCFC',
    finish: 'brillo',
    description: 'Acabado pulido espejo. Máxima luminosidad y reflejo.',
    specifications: { thickness: '9mm', resistance: 'Clase 2', waterproof: true },
  },
  {
    id: 'calacatta-006',
    name: 'Calacatta Suelo',
    collection: 'calacatta',
    format: '45x45cm',
    m2_per_box: 1.23,
    price: 52.00,
    color: '#F2F2F2',
    finish: 'mate',
    description: 'Especial para suelos. Acabado antideslizante mate.',
    specifications: { thickness: '10mm', resistance: 'Clase 4', waterproof: true },
  },
  {
    id: 'calacatta-007',
    name: 'Calacatta Oro',
    collection: 'calacatta',
    format: '30x60cm',
    m2_per_box: 1.08,
    price: 68.00,
    color: '#F9F5F0',
    finish: 'brillo',
    description: 'Tonos dorados sutil en las vetas. Lujo contemporáneo.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'calacatta-008',
    name: 'Calacatta Porcelánico',
    collection: 'calacatta',
    format: '120x60cm',
    m2_per_box: 0.72,
    price: 80.00,
    color: '#FFFFFF',
    finish: 'brillo',
    description: 'Porcelánico técnico de máxima durabilidad. Exteriores e interiores.',
    specifications: { thickness: '12mm', resistance: 'Clase 5', waterproof: true },
  },
  {
    id: 'calacatta-009',
    name: 'Calacatta Mate',
    collection: 'calacatta',
    format: '45x45cm',
    m2_per_box: 1.23,
    price: 58.00,
    color: '#F7F7F7',
    finish: 'mate',
    description: 'Acabado mate natural. Sin reflexiones. Sofisticación moderna.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'calacatta-010',
    name: 'Calacatta Gris Intenso',
    collection: 'calacatta',
    format: '60x120cm',
    m2_per_box: 0.72,
    price: 78.00,
    color: '#B0B0B0',
    finish: 'satinado',
    description: 'Vetas grises muy marcadas y dramáticas. Impacto visual.',
    specifications: { thickness: '11mm', resistance: 'Clase 5', waterproof: true },
  },
];

// Expandir a 50+ productos completando TERRA, NORDICA y BOTANICA
export const terraProducts: Product[] = [
  {
    id: 'terra-001',
    name: 'Terra Naranja',
    collection: 'terra',
    format: '30x30cm',
    m2_per_box: 1.08,
    price: 32.00,
    color: '#C17851',
    finish: 'mate',
    description: 'Tonos cálidos de barro natural. Efecto oxidado rústico.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'terra-002',
    name: 'Terra Rojo Óxido',
    collection: 'terra',
    format: '45x45cm',
    m2_per_box: 1.23,
    price: 38.00,
    color: '#8B5A3C',
    finish: 'mate',
    description: 'Rojo profundo con aspecto de hierro oxidado.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'terra-003',
    name: 'Terra Marrón Claro',
    collection: 'terra',
    format: '30x60cm',
    m2_per_box: 1.08,
    price: 35.00,
    color: '#A0826D',
    finish: 'mate',
    description: 'Tonos tierra suave. Acabado rugoso natural.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'terra-004',
    name: 'Terra Siena',
    collection: 'terra',
    format: '60x60cm',
    m2_per_box: 1.0,
    price: 42.00,
    color: '#A67C52',
    finish: 'mate',
    description: 'Tonos de tierra de Siena. Autenticidad italiana.',
    specifications: { thickness: '10mm', resistance: 'Clase 4', waterproof: true },
  },
  {
    id: 'terra-005',
    name: 'Terra Terracota',
    collection: 'terra',
    format: '45x45cm',
    m2_per_box: 1.23,
    price: 36.00,
    color: '#D2691E',
    finish: 'mate',
    description: 'Clásico terracota. Color ancestral de la cerámica.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'terra-006',
    name: 'Terra Viejo',
    collection: 'terra',
    format: '30x30cm',
    m2_per_box: 1.08,
    price: 30.00,
    color: '#8B6F47',
    finish: 'mate',
    description: 'Efecto desgastado y envejecido. Personalidad rustica.',
    specifications: { thickness: '8mm', resistance: 'Clase 2', waterproof: true },
  },
  {
    id: 'terra-007',
    name: 'Terra Textura',
    collection: 'terra',
    format: '45x45cm',
    m2_per_box: 1.23,
    price: 41.00,
    color: '#B8845C',
    finish: 'mate',
    description: 'Relieve profundo simulando cerámica artesanal.',
    specifications: { thickness: '11mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'terra-008',
    name: 'Terra Mezcla',
    collection: 'terra',
    format: '30x60cm',
    m2_per_box: 1.08,
    price: 40.00,
    color: '#A0826D',
    finish: 'mate',
    description: 'Mezcla multicolor de tonos tierra. Aspecto natural.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'terra-009',
    name: 'Terra Barro',
    collection: 'terra',
    format: '60x60cm',
    m2_per_box: 1.0,
    price: 45.00,
    color: '#9A6B45',
    finish: 'mate',
    description: 'Color de barro auténtico. Acabado natural sin tratar.',
    specifications: { thickness: '10mm', resistance: 'Clase 4', waterproof: true },
  },
  {
    id: 'terra-010',
    name: 'Terra Oscuro',
    collection: 'terra',
    format: '45x45cm',
    m2_per_box: 1.23,
    price: 39.00,
    color: '#6B4423',
    finish: 'mate',
    description: 'Tonos muy oscuros. Drama y sofisticación.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'terra-011',
    name: 'Terra Arenisca',
    collection: 'terra',
    format: '30x30cm',
    m2_per_box: 1.08,
    price: 33.00,
    color: '#C4A574',
    finish: 'satinado',
    description: 'Textura de arenisca natural. Acabado satinado cálido.',
    specifications: { thickness: '9mm', resistance: 'Clase 2', waterproof: true },
  },
];

export const nordicaProducts: Product[] = [
  {
    id: 'nordica-001',
    name: 'Nórdica Blanco',
    collection: 'nordica',
    format: '30x60cm',
    m2_per_box: 1.08,
    price: 42.00,
    color: '#FFFFFF',
    finish: 'mate',
    description: 'Blanco puro escandinavo. Minimalismo puro.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'nordica-002',
    name: 'Nórdica Gris Claro',
    collection: 'nordica',
    format: '45x45cm',
    m2_per_box: 1.23,
    price: 44.00,
    color: '#D8D8D8',
    finish: 'mate',
    description: 'Gris suave escandinavo. Tendencia moderna.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'nordica-003',
    name: 'Nórdica Gris Medio',
    collection: 'nordica',
    format: '60x60cm',
    m2_per_box: 1.0,
    price: 48.00,
    color: '#B0B0B0',
    finish: 'mate',
    description: 'Gris neutro versátil. Combina con todo.',
    specifications: { thickness: '10mm', resistance: 'Clase 4', waterproof: true },
  },
  {
    id: 'nordica-004',
    name: 'Nórdica Gris Oscuro',
    collection: 'nordica',
    format: '30x30cm',
    m2_per_box: 1.08,
    price: 40.00,
    color: '#787878',
    finish: 'mate',
    description: 'Gris oscuro elegante. Carácter y profundidad.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'nordica-005',
    name: 'Nórdica Líneas',
    collection: 'nordica',
    format: '45x45cm',
    m2_per_box: 1.23,
    price: 46.00,
    color: '#E8E8E8',
    finish: 'mate',
    description: 'Patrón minimalista de líneas grises. Arte geométrico.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'nordica-006',
    name: 'Nórdica Suelo',
    collection: 'nordica',
    format: '30x60cm',
    m2_per_box: 1.08,
    price: 45.00,
    color: '#C0C0C0',
    finish: 'mate',
    description: 'Especial para suelos. Resistencia máxima antideslizante.',
    specifications: { thickness: '11mm', resistance: 'Clase 5', waterproof: true },
  },
  {
    id: 'nordica-007',
    name: 'Nórdica Hielo',
    collection: 'nordica',
    format: '60x60cm',
    m2_per_box: 1.0,
    price: 50.00,
    color: '#F0F0F0',
    finish: 'brillo',
    description: 'Blanco puro con acabado satinado. Limpieza absoluta.',
    specifications: { thickness: '10mm', resistance: 'Clase 4', waterproof: true },
  },
  {
    id: 'nordica-008',
    name: 'Nórdica Cemento',
    collection: 'nordica',
    format: '45x45cm',
    m2_per_box: 1.23,
    price: 43.00,
    color: '#A5A5A5',
    finish: 'mate',
    description: 'Efecto cemento pulido. Industrial minimalista.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'nordica-009',
    name: 'Nórdica Natural',
    collection: 'nordica',
    format: '30x30cm',
    m2_per_box: 1.08,
    price: 38.00,
    color: '#E0E0E0',
    finish: 'mate',
    description: 'Tonos naturales claros. Calidez nórdica.',
    specifications: { thickness: '8mm', resistance: 'Clase 2', waterproof: true },
  },
];

export const botanicaProducts: Product[] = [
  {
    id: 'botanica-001',
    name: 'Botánica Verde Esmeralda',
    collection: 'botanica',
    format: '30x60cm',
    m2_per_box: 1.08,
    price: 48.00,
    color: '#2D5016',
    finish: 'brillo',
    description: 'Verde intenso de selva. Brillo natural vegetal.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'botanica-002',
    name: 'Botánica Hoja Verde',
    collection: 'botanica',
    format: '45x45cm',
    m2_per_box: 1.23,
    price: 50.00,
    color: '#4A7C59',
    finish: 'mate',
    description: 'Verde hoja fresco. Patrón botánico sutil.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'botanica-003',
    name: 'Botánica Musgo',
    collection: 'botanica',
    format: '60x60cm',
    m2_per_box: 1.0,
    price: 52.00,
    color: '#6B8E5F',
    finish: 'mate',
    description: 'Verde musgo natural. Textura orgánica.',
    specifications: { thickness: '10mm', resistance: 'Clase 4', waterproof: true },
  },
  {
    id: 'botanica-004',
    name: 'Botánica Menta',
    collection: 'botanica',
    format: '30x30cm',
    m2_per_box: 1.08,
    price: 45.00,
    color: '#8FB48F',
    finish: 'brillo',
    description: 'Verde menta suave. Frescura y serenidad.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'botanica-005',
    name: 'Botánica Tropical',
    collection: 'botanica',
    format: '45x45cm',
    m2_per_box: 1.23,
    price: 51.00,
    color: '#5D7E5D',
    finish: 'mate',
    description: 'Patrón tropical con hojas y flores. Vibración natural.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'botanica-006',
    name: 'Botánica Follaje',
    collection: 'botanica',
    format: '30x60cm',
    m2_per_box: 1.08,
    price: 49.00,
    color: '#7BA428',
    finish: 'mate',
    description: 'Follaje abundante en tonos verdes. Naturaleza pura.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
  {
    id: 'botanica-007',
    name: 'Botánica Agua',
    collection: 'botanica',
    format: '60x60cm',
    m2_per_box: 1.0,
    price: 53.00,
    color: '#5DA5A5',
    finish: 'brillo',
    description: 'Verde agua. Efecto líquido y fluido. Muy refrescante.',
    specifications: { thickness: '10mm', resistance: 'Clase 4', waterproof: true },
  },
  {
    id: 'botanica-008',
    name: 'Botánica Jade',
    collection: 'botanica',
    format: '45x45cm',
    m2_per_box: 1.23,
    price: 54.00,
    color: '#3FA0A0',
    finish: 'brillo',
    description: 'Verde jade intenso. Lujo y rareza oriental.',
    specifications: { thickness: '10mm', resistance: 'Clase 3', waterproof: true },
  },
];

export const allProducts = [
  ...products,
  ...terraProducts,
  ...nordicaProducts,
  ...botanicaProducts,
];
```

- [ ] **Step 3: Create testimonials data**

Create `src/data/testimonials.ts`:
```typescript
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
```

- [ ] **Step 4: Create FAQ data**

Create `src/data/faq.ts`:
```typescript
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'productos' | 'pedidos' | 'entrega' | 'garantia' | 'general';
}

export const faqItems: FAQItem[] = [
  {
    id: 'faq-001',
    question: '¿Qué es la cerámica porcelánica?',
    answer: 'La cerámica porcelánica es un material de construcción de alta resistencia, fabricado a partir de arcilla especial cocida a temperaturas muy altas. Es más resistente, duradera e hidrófuga que la cerámica tradicional, ideal para suelos, baños y cocinas.',
    category: 'productos',
  },
  {
    id: 'faq-002',
    question: '¿Cuál es la diferencia entre mate y brillo?',
    answer: 'El acabado mate tiene una superficie sin brillo, ideal para suelos (antideslizante) y espacios rústicos. El acabado brillo es reflectante, perfecto para paredes en espacios que requieren luminosidad.',
    category: 'productos',
  },
  {
    id: 'faq-003',
    question: '¿Puedo usar los azulejos en exteriores?',
    answer: 'Algunos de nuestros productos sí están certificados para exterior. Consulta las especificaciones técnicas de cada colección o contacta con nuestro equipo para recomendaciones específicas.',
    category: 'productos',
  },
  {
    id: 'faq-004',
    question: '¿Cuál es el tiempo de entrega?',
    answer: 'En España trabajamos con entregas en 2-3 días hábiles para pedidos en stock. Para pedidos especiales, el plazo puede extenderse hasta 5-7 días. Contacta para conocer tu fecha exacta.',
    category: 'entrega',
  },
  {
    id: 'faq-005',
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos transferencia bancaria, tarjeta de crédito/débito (Visa, Mastercard), PayPal y para clientes mayoristas, financiación especial. Consulta con nuestro equipo.',
    category: 'pedidos',
  },
  {
    id: 'faq-006',
    question: '¿Ofrecen descuentos por volumen?',
    answer: 'Sí, contamos con precios especiales para compras mayoristas. Cuanto mayor sea el pedido, mejores serán los precios. Solicita un presupuesto personalizado.',
    category: 'pedidos',
  },
  {
    id: 'faq-007',
    question: '¿Cuáles son los costos de envío?',
    answer: 'Los costos de envío dependen de la cantidad y destino. Para España peninsular, realizamos envíos con coste variable según peso y distancia. Solicita un presupuesto sin compromiso.',
    category: 'entrega',
  },
  {
    id: 'faq-008',
    question: '¿Qué garantía ofrecen?',
    answer: 'Todos nuestros productos cuentan con garantía de fabricación de 2 años contra defectos de material. Además, garantizamos exactitud en colores y acabados.',
    category: 'garantia',
  },
  {
    id: 'faq-009',
    question: '¿Puedo devolver un pedido?',
    answer: 'Sí, contamos con política de devolución de 15 días. El producto debe estar en condiciones originales. Consulta nuestras condiciones de devolución.',
    category: 'pedidos',
  },
  {
    id: 'faq-010',
    question: '¿Ofrecen asesoramiento de diseño?',
    answer: 'Sí, nuestro equipo de expertos está disponible vía WhatsApp, email y llamada para asesorarte sin costo. Podemos ayudarte a elegir los mejores productos para tu proyecto.',
    category: 'general',
  },
];
```

---

### Task 3: Create Reusable Components

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/Footer.tsx`
- Create: `src/components/ProductCard.tsx`
- Create: `src/components/HeroSection.tsx`
- Create: `src/components/Testimonials.tsx`
- Create: `src/components/ContactForm.tsx`

- [ ] **Step 1: Create Header component**

Create `src/components/Header.tsx`:
```typescript
import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '../styles/components.css'

export default function Header() {
  const [isAuth, setIsAuth] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsAuth(!!localStorage.getItem('token'))
  }, [])

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">🏺</span>
          <span className="logo-text">Newzelland</span>
        </Link>

        <button 
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Inicio
          </Link>
          <Link 
            to="/about" 
            className={`nav-link ${isActive('/about') ? 'active' : ''}`}
          >
            Sobre Nosotros
          </Link>
          <Link 
            to="/collections" 
            className={`nav-link ${isActive('/collections') ? 'active' : ''}`}
          >
            Colecciones
          </Link>
          <Link 
            to="/catalog" 
            className={`nav-link ${isActive('/catalog') ? 'active' : ''}`}
          >
            Catálogo
          </Link>
          <Link 
            to="/downloads" 
            className={`nav-link ${isActive('/downloads') ? 'active' : ''}`}
          >
            Descargas
          </Link>
          <Link 
            to="/faq" 
            className={`nav-link ${isActive('/faq') ? 'active' : ''}`}
          >
            FAQ
          </Link>
          <Link 
            to="/contact" 
            className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
          >
            Contacto
          </Link>

          {!isAuth ? (
            <>
              <Link to="/login" className="nav-link auth">Iniciar Sesión</Link>
              <Link to="/register" className="nav-link auth">Registrarse</Link>
            </>
          ) : (
            <>
              <Link to="/cart" className="nav-link auth">🛒 Carrito</Link>
              <Link to="/dashboard" className="nav-link auth">Dashboard</Link>
              <Link to="/admin" className="nav-link auth">Admin</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Create Footer component**

Create `src/components/Footer.tsx`:
```typescript
import { Link } from 'react-router-dom'
import '../styles/components.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Sobre Newzelland</h3>
          <p>
            Distribuidor de cerámica premium importada, con más de 50 diseños
            de alta calidad para proyectos residenciales y comerciales.
          </p>
        </div>

        <div className="footer-section">
          <h3>Navegación</h3>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/about">Sobre Nosotros</Link></li>
            <li><Link to="/collections">Colecciones</Link></li>
            <li><Link to="/catalog">Catálogo</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Servicios</h3>
          <ul>
            <li><Link to="/downloads">Descargas PDF</Link></li>
            <li><Link to="/faq">Preguntas Frecuentes</Link></li>
            <li><Link to="/contact">Contacto</Link></li>
            <li><a href="https://wa.me/34XXXXXXXXX" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contacto</h3>
          <p>
            Email: <a href="mailto:info@newzelland.es">info@newzelland.es</a><br/>
            WhatsApp: <a href="https://wa.me/34XXXXXXXXX">+34 XXX XXX XXX</a><br/>
            Teléfono: +34 XXX XXX XXX
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Newzelland Cerámicas. Todos los derechos reservados.</p>
        <div className="footer-links">
          <a href="#privacy">Privacidad</a>
          <a href="#terms">Términos</a>
          <a href="#cookies">Cookies</a>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Create ProductCard component**

Create `src/components/ProductCard.tsx`:
```typescript
import { Product } from '../data/products'
import '../styles/components.css'

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
  onViewDetails?: (productId: string) => void
}

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onViewDetails 
}: ProductCardProps) {
  return (
    <div className="product-card animate-fade-in-up">
      <div className="product-image">
        <div 
          className="image-placeholder"
          style={{ background: product.color || 'linear-gradient(135deg, #D4A574 0%, #8B7355 100%)' }}
        >
          <div className="collection-badge">{product.collection.toUpperCase()}</div>
        </div>
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-format">{product.format}</p>
        <p className="product-description">{product.description}</p>

        <div className="product-specs">
          <div className="spec">
            <span className="label">m² por caja:</span>
            <span className="value">{product.m2_per_box}</span>
          </div>
          {product.finish && (
            <div className="spec">
              <span className="label">Acabado:</span>
              <span className="value">{product.finish}</span>
            </div>
          )}
        </div>

        <div className="product-footer">
          <div className="price">€{product.price.toFixed(2)}</div>
          <div className="product-actions">
            {onViewDetails && (
              <button 
                className="btn-secondary"
                onClick={() => onViewDetails(product.id)}
              >
                Ver Detalles
              </button>
            )}
            {onAddToCart && (
              <button 
                className="btn-primary"
                onClick={() => onAddToCart(product)}
              >
                Al Carrito
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create HeroSection component**

Create `src/components/HeroSection.tsx`:
```typescript
import '../styles/components.css'

interface HeroProps {
  title: string
  subtitle: string
  backgroundImage?: string
  backgroundColor?: string
  cta?: {
    text: string
    link: string
  }
}

export default function HeroSection({ 
  title, 
  subtitle, 
  backgroundImage,
  backgroundColor = 'linear-gradient(135deg, #8B7355 0%, #C17851 100%)',
  cta 
}: HeroProps) {
  return (
    <section 
      className="hero-section"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        background: !backgroundImage ? backgroundColor : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="hero-overlay"></div>
      <div className="hero-content animate-fade-in-up">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {cta && (
          <a href={cta.link} className="btn-primary btn-large">
            {cta.text}
          </a>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Create Testimonials component**

Create `src/components/Testimonials.tsx`:
```typescript
import { testimonials } from '../data/testimonials'
import '../styles/components.css'

export default function Testimonials() {
  return (
    <section className="testimonials-section">
      <div className="container">
        <h2 className="section-title">Lo que dicen nuestros clientes</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card animate-fade-in-up">
              <div className="rating">
                {'⭐'.repeat(testimonial.rating)}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <p className="testimonial-author">{testimonial.author}</p>
              {testimonial.company && (
                <p className="testimonial-company">{testimonial.company}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Create ContactForm component**

Create `src/components/ContactForm.tsx`:
```typescript
import { useState } from 'react'
import '../styles/components.css'

interface ContactFormData {
  name: string
  email: string
  phone: string
  company: string
  message: string
}

interface ContactFormProps {
  onSubmit?: (data: ContactFormData) => Promise<void>
}

export default function ContactForm({ onSubmit }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (onSubmit) {
        await onSubmit(formData)
      } else {
        // Fallback: store in localStorage
        localStorage.setItem('contact_form', JSON.stringify(formData))
      }
      setSuccess(true)
      setFormData({ name: '', email: '', phone: '', company: '', message: '' })
      setTimeout(() => setSuccess(false), 5000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Nombre *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Teléfono</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="company">Empresa</label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="message">Mensaje *</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
        />
      </div>

      {success && (
        <div className="success-message">
          ✓ Mensaje enviado correctamente. Te contactaremos pronto.
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Enviando...' : 'Enviar Mensaje'}
      </button>
    </form>
  )
}
```

---

### Task 4: Create Component Styles

**Files:**
- Create: `src/styles/components.css`

- [ ] **Step 1: Create comprehensive components CSS**

Create `src/styles/components.css`:
```css
/* HEADER */
.header {
  background-color: var(--color-white);
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-2xl);
  color: var(--color-primary-dark);
  transition: color var(--transition-base);
}

.logo:hover {
  color: var(--color-accent);
}

.logo-icon {
  font-size: var(--font-size-3xl);
}

.logo-text {
  display: none;
}

@media (min-width: 768px) {
  .logo-text {
    display: inline;
  }
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: var(--font-size-2xl);
  cursor: pointer;
  color: var(--color-primary);
  padding: 0;
  margin: 0;
}

@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }
}

.nav {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
}

@media (max-width: 768px) {
  .nav {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    gap: 0;
    background-color: var(--color-white);
    max-height: 0;
    overflow: hidden;
    transition: max-height var(--transition-base);
  }

  .nav.open {
    max-height: 500px;
  }

  .nav-link {
    width: 100%;
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-gray-200);
    text-align: left;
  }
}

.nav-link {
  color: var(--color-gray-700);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-base);
  position: relative;
}

.nav-link:hover,
.nav-link.active {
  color: var(--color-accent);
}

.nav-link.auth {
  background-color: var(--color-accent);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  border: none;
}

.nav-link.auth:hover {
  background-color: var(--color-accent-dark);
  color: white;
}

/* HERO SECTION */
.hero-section {
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
  padding: var(--spacing-xl);
}

.hero-content h1 {
  color: white;
  font-size: var(--font-size-5xl);
  margin-bottom: var(--spacing-lg);
}

.hero-content p {
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xl);
}

.btn-large {
  display: inline-block;
  padding: var(--spacing-lg) var(--spacing-2xl);
  font-size: var(--font-size-lg);
}

@media (max-width: 768px) {
  .hero-section {
    min-height: 300px;
  }

  .hero-content h1 {
    font-size: var(--font-size-3xl);
  }

  .hero-content p {
    font-size: var(--font-size-base);
  }
}

/* PRODUCT CARD */
.product-card {
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}

.product-image {
  position: relative;
  width: 100%;
  padding-bottom: 75%;
  overflow: hidden;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-4xl);
}

.collection-badge {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background-color: rgba(255, 255, 255, 0.9);
  color: var(--color-primary-dark);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.product-info {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-info h3 {
  margin-bottom: var(--spacing-sm);
  color: var(--color-primary-dark);
}

.product-format {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  margin-bottom: var(--spacing-md);
}

.product-description {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-md);
  flex-grow: 1;
}

.product-specs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-md);
}

.spec {
  display: flex;
  flex-direction: column;
}

.spec .label {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  font-weight: var(--font-weight-semibold);
}

.spec .value {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  border-top: 1px solid var(--color-gray-200);
  padding-top: var(--spacing-md);
}

.price {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent);
}

.product-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-grow: 1;
}

.product-actions button {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
}

.btn-primary {
  background-color: var(--color-accent);
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: var(--color-accent-dark);
}

.btn-secondary {
  background-color: var(--color-gray-200);
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-300);
}

.btn-secondary:hover {
  background-color: var(--color-gray-300);
}

/* TESTIMONIALS */
.testimonials-section {
  padding: var(--spacing-3xl) 0;
  background-color: var(--color-gray-50);
}

.section-title {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-xl);
}

.testimonial-card {
  background-color: var(--color-white);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.rating {
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-lg);
}

.testimonial-text {
  font-style: italic;
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-md);
  line-height: 1.8;
}

.testimonial-author {
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-dark);
  margin-bottom: var(--spacing-sm);
}

.testimonial-company {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
}

/* CONTACT FORM */
.contact-form {
  max-width: 600px;
  margin: 0 auto;
  background-color: var(--color-white);
  padding: var(--spacing-2xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.form-group {
  margin-bottom: var(--spacing-lg);
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: var(--spacing-sm);
  color: var(--color-primary-dark);
  font-weight: var(--font-weight-semibold);
}

.form-group input,
.form-group textarea {
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-family: var(--font-sans);
  transition: border-color var(--transition-base);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(193, 120, 81, 0.1);
}

.success-message {
  background-color: var(--color-success);
  color: white;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.contact-form button {
  width: 100%;
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  background-color: var(--color-accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.contact-form button:hover:not(:disabled) {
  background-color: var(--color-accent-dark);
  transform: translateY(-2px);
}

.contact-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* FOOTER */
.footer {
  background-color: var(--color-primary-dark);
  color: var(--color-white);
  padding: var(--spacing-3xl) 0 var(--spacing-lg);
  margin-top: var(--spacing-3xl);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
}

.footer-section h3 {
  color: var(--color-white);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-lg);
}

.footer-section p,
.footer-section a {
  color: rgba(255, 255, 255, 0.8);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-sm);
  transition: color var(--transition-base);
}

.footer-section a:hover {
  color: var(--color-secondary);
  text-decoration: underline;
}

.footer-section ul {
  list-style: none;
}

.footer-section ul li {
  margin-bottom: var(--spacing-sm);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
  padding-left: var(--spacing-lg);
  padding-right: var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.footer-bottom p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: var(--font-size-sm);
}

.footer-links {
  display: flex;
  gap: var(--spacing-lg);
}

@media (max-width: 768px) {
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }

  .footer-links {
    width: 100%;
    flex-direction: column;
  }
}

/* UTILITY CLASSES */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.section-padding {
  padding: var(--spacing-3xl) 0;
}

@media (max-width: 768px) {
  .section-padding {
    padding: var(--spacing-2xl) 0;
  }
}
```

---

### Task 5: Create Enhanced HomePage

**Files:**
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 1: Rewrite HomePage with all sections**

Modify `src/pages/HomePage.tsx`:
```typescript
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import ProductCard from '../components/ProductCard'
import Testimonials from '../components/Testimonials'
import { collections } from '../data/collections'
import { allProducts } from '../data/products'
import '../styles/components.css'

export default function HomePage() {
  const [isAuth, setIsAuth] = useState(false)
  const [featuredProducts] = useState(allProducts.slice(0, 6))

  useEffect(() => {
    setIsAuth(!!localStorage.getItem('token'))
  }, [])

  const addToCart = (product: any) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.id === product.id)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    alert('Producto agregado al carrito')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <HeroSection
          title="Cerámica Premium Importada"
          subtitle="Descubre nuestras 50+ diseños de alta calidad para proyectos residenciales y comerciales"
          cta={{ text: 'Explorar Catálogo', link: '/catalog' }}
        />

        {/* Why Choose Us */}
        <section style={{ padding: 'var(--spacing-3xl) 0', backgroundColor: 'var(--color-gray-50)' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
              ¿Por qué Newzelland?
            </h2>
            <div className="grid grid-cols-1 grid-cols-3">
              <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🏆</div>
                <h3>Calidad Premium</h3>
                <p>Cerámica importada de las mejores fabricantes españolas con certificación internacional.</p>
              </div>
              <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>⚡</div>
                <h3>Entrega Rápida</h3>
                <p>Entrega en toda España en 2-3 días hábiles. Somos rápidos, confiables y eficientes.</p>
              </div>
              <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>💰</div>
                <h3>Precios Competitivos</h3>
                <p>Precios al por mayor sin renunciar a la calidad. Descuentos por volumen disponibles.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
              Productos Destacados
            </h2>
            <div className="grid grid-cols-1 grid-cols-3">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onViewDetails={() => console.log('Ver detalles:', product.id)}
                />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 'var(--spacing-2xl)' }}>
              <Link to="/catalog">
                <button style={{ padding: 'var(--spacing-md) var(--spacing-xl)' }}>
                  Ver Catálogo Completo
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Collections */}
        <section style={{ padding: 'var(--spacing-3xl) 0', backgroundColor: 'var(--color-gray-50)' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
              Colecciones
            </h2>
            <div className="grid grid-cols-1 grid-cols-2">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  to={`/collections/${collection.slug}`}
                  style={{ textDecoration: 'none', cursor: 'pointer' }}
                >
                  <div 
                    style={{
                      background: collection.image,
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--spacing-2xl)',
                      color: 'white',
                      textAlign: 'center',
                      minHeight: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all var(--transition-base)',
                      cursor: 'pointer',
                    }}
                    className="hover-lift"
                  >
                    <h3 style={{ color: 'white' }}>{collection.name}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: 'var(--spacing-md)' }}>
                      {collection.productCount} productos
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* CTA Section */}
        <section style={{
          padding: 'var(--spacing-3xl)',
          background: 'linear-gradient(135deg, #8B7355 0%, #C17851 100%)',
          color: 'white',
          textAlign: 'center',
        }}>
          <div className="container">
            <h2 style={{ color: 'white', marginBottom: 'var(--spacing-lg)' }}>
              ¿Necesitas Asesoramiento?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 'var(--spacing-lg)', fontSize: 'var(--font-size-lg)' }}>
              Nuestro equipo de expertos está disponible para ayudarte sin costo
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact">
                <button style={{ padding: 'var(--spacing-md) var(--spacing-xl)' }}>
                  Contactar por Email
                </button>
              </Link>
              <a href="https://wa.me/34XXXXXXXXX" target="_blank" rel="noopener noreferrer">
                <button style={{ padding: 'var(--spacing-md) var(--spacing-xl)', background: '#25D366' }}>
                  💬 Contactar por WhatsApp
                </button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
```

---

### Task 6: Create New Pages (Part 1)

**Files:**
- Create: `src/pages/AboutPage.tsx`
- Create: `src/pages/CollectionsPage.tsx`
- Create: `src/pages/ContactPage.tsx`

- [ ] **Step 1: Create About Page**

Create `src/pages/AboutPage.tsx`:
```typescript
import Header from '../components/Header'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'

export default function AboutPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: 1 }}>
        <HeroSection
          title="Sobre Newzelland"
          subtitle="Más de 15 años distribuyendo cerámica premium en España"
        />

        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container">
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2>Nuestra Historia</h2>
              <p>
                Newzelland nace en 2010 con la visión de revolucionar la distribución de cerámica
                premium en España. Comenzamos como una pequeña empresa familiar dedicada a importar
                cerámica de calidad desde los mejores fabricantes españoles.
              </p>

              <p>
                A lo largo de los años, hemos construido relaciones sólidas con fabricantes de
                renombre internacional, permitiéndonos ofrecer a nuestros clientes los mejores
                diseños y calidades del mercado a precios competitivos.
              </p>

              <h2 style={{ marginTop: 'var(--spacing-2xl)' }}>Nuestra Misión</h2>
              <p>
                Ser el distribuidor de cerámica premium más confiable de España, proporcionando
                a arquitectos, diseñadores, constructores y propietarios acceso a los mejores
                productos cerámicos con un servicio excepcional.
              </p>

              <h2 style={{ marginTop: 'var(--spacing-2xl)' }}>Nuestros Valores</h2>
              <ul style={{ marginBottom: 'var(--spacing-lg)' }}>
                <li><strong>Calidad:</strong> Solo distribuidores de marcas de excelencia</li>
                <li><strong>Confiabilidad:</strong> Entrega a tiempo, siempre</li>
                <li><strong>Transparencia:</strong> Precios justos, sin sorpresas</li>
                <li><strong>Innovación:</strong> Constantemente buscamos nuevas colecciones</li>
                <li><strong>Servicio:</strong> Asesoramiento personal para cada cliente</li>
              </ul>

              <h2>¿Por Qué Elegirnos?</h2>
              <div className="grid grid-cols-1 grid-cols-2">
                <div style={{ padding: 'var(--spacing-lg)' }}>
                  <h3>50+ Diseños Exclusivos</h3>
                  <p>
                    Acceso a las colecciones más innovadoras y tendencias actuales en cerámica.
                  </p>
                </div>
                <div style={{ padding: 'var(--spacing-lg)' }}>
                  <h3>Precios Mayoristas</h3>
                  <p>
                    Descuentos especiales por volumen. Cálculo transparente de costos.
                  </p>
                </div>
                <div style={{ padding: 'var(--spacing-lg)' }}>
                  <h3>Entrega Garantizada</h3>
                  <p>
                    Logística eficiente en toda España. Seguimiento en tiempo real.
                  </p>
                </div>
                <div style={{ padding: 'var(--spacing-lg)' }}>
                  <h3>Asesoramiento Gratuito</h3>
                  <p>
                    Expertos disponibles via WhatsApp, email o teléfono para guiarte.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
```

- [ ] **Step 2: Create Collections Page**

Create `src/pages/CollectionsPage.tsx`:
```typescript
import { useParams, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import ProductCard from '../components/ProductCard'
import { collections } from '../data/collections'
import { allProducts } from '../data/products'

export default function CollectionsPage() {
  const { slug } = useParams<{ slug: string }>()
  
  const collectionList = slug 
    ? collections.filter(c => c.slug === slug)
    : collections

  const productsToShow = slug
    ? allProducts.filter(p => p.collection === slug)
    : allProducts

  const addToCart = (product: any) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.id === product.id)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    alert('Producto agregado al carrito')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: 1 }}>
        {slug ? (
          <>
            {collectionList.length > 0 && (
              <HeroSection
                title={collectionList[0].name}
                subtitle={collectionList[0].description}
                backgroundColor={collectionList[0].image}
              />
            )}
          </>
        ) : (
          <HeroSection
            title="Nuestras Colecciones"
            subtitle="Explora nuestras 5 colecciones de cerámica premium"
          />
        )}

        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container">
            {!slug && (
              <div className="grid grid-cols-1 grid-cols-2">
                {collections.map((collection) => (
                  <Link
                    key={collection.id}
                    to={`/collections/${collection.slug}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={{
                        background: collection.image,
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--spacing-2xl)',
                        color: 'white',
                        textAlign: 'center',
                        minHeight: '250px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      className="hover-lift"
                    >
                      <h3 style={{ color: 'white', marginBottom: 'var(--spacing-md)' }}>
                        {collection.name}
                      </h3>
                      <p style={{ color: 'rgba(255,255,255,0.9)' }}>
                        {collection.productCount} productos
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {slug && productsToShow.length > 0 && (
              <>
                <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                  <Link to="/collections" style={{ color: 'var(--color-accent)' }}>
                    ← Volver a Colecciones
                  </Link>
                </div>
                <div className="grid grid-cols-1 grid-cols-3">
                  {productsToShow.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
```

- [ ] **Step 3: Create Contact Page**

Create `src/pages/ContactPage.tsx`:
```typescript
import Header from '../components/Header'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import ContactForm from '../components/ContactForm'

export default function ContactPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: 1 }}>
        <HeroSection
          title="Ponte en Contacto"
          subtitle="Nuestro equipo está listo para ayudarte"
        />

        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container">
            <div className="grid grid-cols-1 grid-cols-2" style={{ gap: 'var(--spacing-3xl)' }}>
              <div>
                <h2>Información de Contacto</h2>
                <div style={{ marginTop: 'var(--spacing-2xl)' }}>
                  <h3>Dirección</h3>
                  <p>
                    Calle Cerámica, 123<br/>
                    46001 Valencia, España
                  </p>
                </div>

                <div style={{ marginTop: 'var(--spacing-2xl)' }}>
                  <h3>Teléfono</h3>
                  <p>
                    <a href="tel:+34961234567">+34 961 234 567</a><br/>
                    Lunes a Viernes: 9:00 - 18:00
                  </p>
                </div>

                <div style={{ marginTop: 'var(--spacing-2xl)' }}>
                  <h3>Email</h3>
                  <p>
                    <a href="mailto:info@newzelland.es">info@newzelland.es</a><br/>
                    Respuesta en 24 horas
                  </p>
                </div>

                <div style={{ marginTop: 'var(--spacing-2xl)' }}>
                  <h3>WhatsApp</h3>
                  <p>
                    <a href="https://wa.me/34961234567" target="_blank" rel="noopener noreferrer">
                      +34 961 234 567
                    </a><br/>
                    Respuesta inmediata (9:00 - 20:00)
                  </p>
                </div>
              </div>

              <div>
                <h2>Envíanos un Mensaje</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
```

---

### Task 7: Create New Pages (Part 2)

**Files:**
- Create: `src/pages/FAQPage.tsx`
- Create: `src/pages/DownloadsPage.tsx`

- [ ] **Step 1: Create FAQ Page**

Create `src/pages/FAQPage.tsx`:
```typescript
import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import { faqItems } from '../data/faq'

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>(null)

  const categories = ['general', 'productos', 'pedidos', 'entrega', 'garantia']
  const categoryLabels: Record<string, string> = {
    general: 'Preguntas Generales',
    productos: 'Sobre Productos',
    pedidos: 'Pedidos',
    entrega: 'Entrega',
    garantia: 'Garantía',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: 1 }}>
        <HeroSection
          title="Preguntas Frecuentes"
          subtitle="Encuentra respuestas a tus dudas"
        />

        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            {categories.map((category) => {
              const categoryFAQs = faqItems.filter(item => item.category === category)
              if (categoryFAQs.length === 0) return null

              return (
                <div key={category} style={{ marginBottom: 'var(--spacing-3xl)' }}>
                  <h2 style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-primary-dark)' }}>
                    {categoryLabels[category]}
                  </h2>

                  {categoryFAQs.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        marginBottom: 'var(--spacing-md)',
                        border: '1px solid var(--color-gray-300)',
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        onClick={() => setOpenId(openId === item.id ? null : item.id)}
                        style={{
                          width: '100%',
                          padding: 'var(--spacing-lg)',
                          background: openId === item.id 
                            ? 'var(--color-gray-100)' 
                            : 'var(--color-white)',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: 'var(--font-size-base)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--color-primary-dark)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all var(--transition-base)',
                        }}
                      >
                        {item.question}
                        <span style={{
                          transform: openId === item.id ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform var(--transition-base)',
                        }}>
                          ▼
                        </span>
                      </button>

                      {openId === item.id && (
                        <div style={{
                          padding: 'var(--spacing-lg)',
                          borderTop: '1px solid var(--color-gray-200)',
                          backgroundColor: 'var(--color-gray-50)',
                          color: 'var(--color-gray-600)',
                          lineHeight: '1.8',
                        }}>
                          {item.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
```

- [ ] **Step 2: Create Downloads Page**

Create `src/pages/DownloadsPage.tsx`:
```typescript
import Header from '../components/Header'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import { collections } from '../data/collections'

export default function DownloadsPage() {
  const catalogs = [
    { id: 'atlas', name: 'Atlas', description: 'Colección elegante con tonos naturales' },
    { id: 'calacatta', name: 'Calacatta', description: 'Inspirada en mármol de Carrara' },
    { id: 'terra', name: 'Terra', description: 'Colección rústica con tonos cálidos' },
    { id: 'nordica', name: 'Nórdica', description: 'Diseño escandinavo minimalista' },
    { id: 'botanica', name: 'Botánica', description: 'Patrones inspirados en la naturaleza' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: 1 }}>
        <HeroSection
          title="Descargas"
          subtitle="Catálogos PDF de nuestras colecciones"
        />

        <section style={{ padding: 'var(--spacing-3xl) 0' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
              Catálogos de Colecciones
            </h2>

            <div className="grid grid-cols-1 grid-cols-2">
              {catalogs.map((catalog) => (
                <div
                  key={catalog.id}
                  style={{
                    background: 'var(--color-white)',
                    padding: 'var(--spacing-xl)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-lg)',
                  }}
                  className="hover-lift"
                >
                  <div>
                    <h3>{catalog.name}</h3>
                    <p style={{ color: 'var(--color-gray-600)' }}>
                      {catalog.description}
                    </p>
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    <button
                      onClick={() => {
                        alert(`Descargando catálogo ${catalog.name}...`)
                        // En producción, aquí iría la lógica de descarga real
                      }}
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-md)',
                        background: 'var(--color-accent)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontWeight: 'var(--font-weight-semibold)',
                      }}
                    >
                      📥 Descargar PDF
                    </button>
                  </div>

                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-gray-500)',
                    textAlign: 'center',
                  }}>
                    PDF • 5-8 MB • Especificaciones técnicas incluidas
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Resources */}
            <div style={{ marginTop: 'var(--spacing-3xl)', textAlign: 'center' }}>
              <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>
                ¿Necesitas Material Personalizado?
              </h2>
              <p style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-gray-600)' }}>
                Contacta con nuestro equipo para presupuestos, muestras o catálogos personalizados
              </p>
              <button
                onClick={() => window.location.href = '/contact'}
                style={{
                  padding: 'var(--spacing-md) var(--spacing-xl)',
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 'var(--font-weight-semibold)',
                }}
              >
                Solicitar Material Personalizado
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
```

---

### Task 8: Update App Router

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update App.tsx with all new routes**

Modify `src/App.tsx`:
```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import CollectionsPage from './pages/CollectionsPage'
import ContactPage from './pages/ContactPage'
import FAQPage from './pages/FAQPage'
import DownloadsPage from './pages/DownloadsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import CatalogPage from './pages/CatalogPage'
import CartPage from './pages/CartPage'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/collections/:slug" element={<CollectionsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/downloads" element={<DownloadsPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        {isAuthenticated && (
          <>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </>
        )}
      </Routes>
    </Router>
  )
}
```

---

## Summary

This comprehensive plan transforms Newzelland's web presence into a professional, fully-featured e-commerce platform:

**Deliverables:**
- Modern design system with ceramic-themed colors and animations
- 50+ product database across 5 curated collections
- 7 complete pages (Home, About, Collections, Contact, FAQ, Downloads, Catalog)
- Responsive mobile-first design
- Reusable component library
- Professional typography and spacing system
- Customer testimonials showcase
- Contact form integration

**Tech Stack:** React 18, TypeScript, React Router, CSS Grid/Flexbox, Vite

Execute via superpowers:subagent-driven-development or superpowers:executing-plans.
