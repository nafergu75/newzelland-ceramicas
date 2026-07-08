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
