import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CaretLeft, CaretRight, ArrowRight } from '@phosphor-icons/react'
import '../styles/components.css'

/* ============================================================
   CONFIGURACIÓN DEL BANNER
   ------------------------------------------------------------
   · SLIDES: cada ambiente del carrusel.
       image    → URL de la foto de fondo (cámbiala por la tuya)
       eyebrow  → etiqueta pequeña del ambiente ("Baño", "Cocina"...)
       title    → titular principal (máx. 2 líneas)
       subtitle → descripción breve (máx. ~20 palabras)
       ctaText  → texto del botón
       ctaLink  → destino del botón (ruta interna o URL)
   · AUTOPLAY_MS: milisegundos que dura cada slide (0 = sin autoplay).
   · La transición (crossfade 800ms) se define en components.css
     (.hc-slide → transition). El drift de la foto, en @keyframes hcDrift.
   ============================================================ */

export interface HeroSlide {
  image: string
  eyebrow: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
}

const CLOUD = 'https://res.cloudinary.com/dtqgkmije/image/upload/f_auto,q_auto,cs_srgb,w_1600/practika/series'

export const HERO_SLIDES: HeroSlide[] = [
  {
    image: `${CLOUD}/calacata/ambientes/calacata-ambiente-01`,
    eyebrow: 'Baño',
    title: 'Calacata, mármol sereno',
    subtitle: 'Pasta blanca y porcelánico en 30x90 y 60x60. Luz de mármol para baños en calma.',
    ctaText: 'Ver colección',
    ctaLink: '/collections/calacata',
  },
  {
    image: `${CLOUD}/diamond/ambientes/diamond-ambiente-01`,
    eyebrow: 'Salón',
    title: 'Diamond, brillo de gran formato',
    subtitle: 'Porcelánico pulido 60x120 que amplifica la luz del salón.',
    ctaText: 'Ver colección',
    ctaLink: '/collections/diamond',
  },
  {
    image: `${CLOUD}/tokyo/ambientes/tokyo-ambiente-01`,
    eyebrow: 'Cocina',
    title: 'Tokyo, carácter urbano',
    subtitle: 'Porcelánico 60x60 y 80x80 que resiste el día a día de la cocina.',
    ctaText: 'Ver colección',
    ctaLink: '/collections/tokyo',
  },
  {
    image: `${CLOUD}/morella/ambientes/morella-ambiente-01`,
    eyebrow: 'Terraza',
    title: 'Morella, alma mediterránea',
    subtitle: 'Gres 33,3x33,3 con acabados que envejecen bien al aire libre.',
    ctaText: 'Ver colección',
    ctaLink: '/collections/morella',
  },
]

export const AUTOPLAY_MS = 6000

/* ============================================================ */

export default function HeroCarousel({ slides = HERO_SLIDES }: { slides?: HeroSlide[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const reduceMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  const goTo = useCallback(
    (i: number) => setIndex(((i % slides.length) + slides.length) % slides.length),
    [slides.length]
  )
  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  // Autoplay: pausado con hover/focus, pestaña oculta o reduced motion
  useEffect(() => {
    if (AUTOPLAY_MS <= 0 || paused || reduceMotion.current) return
    const id = setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % slides.length)
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [paused, slides.length])

  // Swipe táctil en móvil
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 48) (delta < 0 ? next : prev)()
    touchStartX.current = null
  }

  return (
    <section
      className="hero-carousel"
      aria-roledescription="carrusel"
      aria-label="Ambientes destacados"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.title}
          className={`hc-slide ${i === index ? 'active' : ''}`}
          role="group"
          aria-roledescription="diapositiva"
          aria-label={`${i + 1} de ${slides.length}: ${slide.eyebrow}`}
          aria-hidden={i !== index}
        >
          <img
            src={slide.image}
            alt={`${slide.eyebrow} con la serie ${slide.title.split(',')[0]}`}
            loading={i === 0 ? 'eager' : 'lazy'}
            {...(i === 0 ? { fetchpriority: 'high' as const } : {})}
          />
          <div className="hc-scrim" aria-hidden="true"></div>
          <div className="hc-content">
            <span className="hc-eyebrow">{slide.eyebrow}</span>
            <h2>{slide.title}</h2>
            <p>{slide.subtitle}</p>
            <Link to={slide.ctaLink} className="btn-primary" tabIndex={i === index ? 0 : -1}>
              {slide.ctaText}
              <ArrowRight size={16} weight="regular" />
            </Link>
          </div>
        </div>
      ))}

      <div className="hc-controls">
        <button className="hc-arrow" onClick={prev} aria-label="Ambiente anterior">
          <CaretLeft size={20} weight="regular" />
        </button>
        <button className="hc-arrow" onClick={next} aria-label="Ambiente siguiente">
          <CaretRight size={20} weight="regular" />
        </button>
      </div>

      <div className="hc-dots" role="tablist" aria-label="Ir a un ambiente">
        {slides.map((slide, i) => (
          <button
            key={slide.title}
            className="hc-dot"
            role="tab"
            aria-current={i === index}
            aria-label={`${slide.eyebrow}: ${slide.title}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </section>
  )
}
