import { Link } from 'react-router-dom'
import '../styles/components.css'

interface HeroProps {
  title: string
  subtitle: string
  backgroundImage?: string
  /** Compat: ignorado en el nuevo sistema (las bandas sin foto usan --sand) */
  backgroundColor?: string
  cta?: {
    text: string
    link: string
  }
}

export default function HeroSection({ title, subtitle, backgroundImage, cta }: HeroProps) {
  return (
    <section className={`hero-section ${backgroundImage ? '' : 'plain'}`}>
      {backgroundImage && (
        <>
          <img src={backgroundImage} alt="" aria-hidden="true" className="hero-bg" />
          <div className="hero-overlay"></div>
        </>
      )}
      <div className="hero-content animate-fade-in-up">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {cta && (
          <div style={{ marginTop: 'var(--space-6)' }}>
            <Link to={cta.link} className="btn-primary btn-large">
              {cta.text}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
