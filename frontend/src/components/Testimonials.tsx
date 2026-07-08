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
