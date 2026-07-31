import { Building, House, HardHat } from '@phosphor-icons/react'
import { clientCases, ClientCaseType } from '../data/clientCases'
import '../styles/components.css'

const typeLabels: Record<ClientCaseType, string> = {
  particular: 'Particular',
  arquitectura: 'Estudio de arquitectura',
  contratista: 'Contratista',
}

const typeIcons: Record<ClientCaseType, React.ReactNode> = {
  particular: <House size={24} weight="fill" />,
  arquitectura: <Building size={24} weight="fill" />,
  contratista: <HardHat size={24} weight="fill" />,
}

export default function ClientCases() {
  return (
    <section className="client-cases-section">
      <div className="container">
        <div className="client-cases-header">
          <h2>Casos reales de clientes satisfechos</h2>
          <p>
            Particulares, estudios de arquitectura y contratistas confían en la calidad y el profesionalismo de Newzeland Cerámicas.
          </p>
        </div>

        <div className="client-cases-grid">
          {clientCases.map((caseItem) => (
            <div key={caseItem.id} className="client-case-card">
              <div className="case-header">
                <div className="case-type-badge">
                  <span className="case-icon">{typeIcons[caseItem.type]}</span>
                  <span className="case-type-label">{typeLabels[caseItem.type]}</span>
                </div>
                <p className="case-location">{caseItem.location}</p>
              </div>

              <h3 className="case-title">{caseItem.title}</h3>

              <p className="case-description">{caseItem.description}</p>

              <div className="case-products">
                <strong>Productos utilizados:</strong>
                <ul>
                  {caseItem.products.map((product, idx) => (
                    <li key={idx}>{product}</li>
                  ))}
                </ul>
              </div>

              <blockquote className="case-testimonial">"{caseItem.testimonial}"</blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
