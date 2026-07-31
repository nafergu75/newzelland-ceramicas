export type ClientCaseType = 'particular' | 'arquitectura' | 'contratista'

export interface ClientCase {
  id: string
  type: ClientCaseType
  title: string
  location: string
  description: string
  products: string[]
  testimonial: string
}

export const clientCases: ClientCase[] = [
  {
    id: 'case-1',
    type: 'particular',
    title: 'Reforma integral de vivienda unifamiliar',
    location: 'Valencia',
    description:
      'Reforma completa de cocina, baños y pavimentación de salón-comedor. Aproximadamente 85 m² de nuevas superficies cerámicas.',
    products: ['BOSCO 33,3x33,3 mate', 'BRANDIN 60x120 pulido'],
    testimonial:
      'El trato fue excepcional desde el primer día. La calidad de las cerámicas supera nuestras expectativas y el resultado final es espectacular.',
  },
  {
    id: 'case-2',
    type: 'particular',
    title: 'Reforma de baños y cocina',
    location: 'Castellón',
    description:
      'Actualización de dos baños y cocina en vivienda céntrica. Revestimientos de alta durabilidad con acabado antideslizante.',
    products: ['METRO 20x60 blanco mate', 'ALPINA 23x120 natural'],
    testimonial:
      'Nos encanta cómo ha quedado todo. Cada detalle está perfecto y el personal nos ayudó a elegir los formatos más adecuados para cada zona.',
  },
  {
    id: 'case-3',
    type: 'particular',
    title: 'Pavimentación de terraza exterior',
    location: 'Alicante',
    description:
      'Pavimentación completa de terraza con vistas al mar. Más de 120 m² con series antideslizantes resistentes al clima.',
    products: ['FOREST 19x57 antideslizante', 'FUSTA 19x57 mate'],
    testimonial:
      'Perfecto. Las cerámicas aguantan perfectamente la sal marina y siguen viéndose como nuevas después de dos veranos.',
  },
  {
    id: 'case-4',
    type: 'arquitectura',
    title: 'Proyecto residencial de viviendas de promoción',
    location: 'Castellón',
    description:
      'Diseño de espacios comunes y viviendas de nueva construcción. Más de 400 m² de pavimento y revestimiento con coherencia estética.',
    products: ['CARRARA 60x120 natural', 'CEPPO DI GRÈ 60x60 brillo', 'URBION 30x60 mate'],
    testimonial:
      'Newzeland se convirtió en nuestro socio ideal para este proyecto. Excelentes precios de proyecto, plazos confiables y un equipo muy profesional.',
  },
  {
    id: 'case-5',
    type: 'arquitectura',
    title: 'Oficinas de diseño contemporáneo',
    location: 'Barcelona',
    description:
      'Diseño de pavimentación para oficinas modernas con 180 m² de área común. Se priorizó la durabilidad y el minimalismo estético.',
    products: ['SHADOW 60x120 mate', 'SONORA 60x60 natural'],
    testimonial:
      'Un trabajo impecable. Los muestras llegaron a tiempo, el asesoramiento fue muy claro y el resultado superó lo que habíamos imaginado en planos.',
  },
  {
    id: 'case-6',
    type: 'contratista',
    title: 'Hotel de 4 estrellas en la costa',
    location: 'Benidorm',
    description:
      'Obra hotelera de gran envergadura con habitaciones, baños y áreas comunes. Aproximadamente 600 m² de superficies cerámicas de alta resistencia.',
    products: ['TOKYO 60x60 pulido', 'MAGNUM 90x90 natural', 'PIETRA 60x60 brillo'],
    testimonial:
      'Newzeland fue muy fiable en cada etapa. Entregas puntuales, calidad garantizada y un servicio postventa atento a cualquier detalle.',
  },
]
