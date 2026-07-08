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
