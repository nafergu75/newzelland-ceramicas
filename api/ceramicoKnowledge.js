/**
 * CERAMICO TECHNICAL KNOWLEDGE BASE
 *
 * Modulo de conocimiento tecnico sobre ceramica, azulejos y porcelanico
 * para enriquecer las respuestas del chatbot Ceramico.
 *
 * Estructura:
 * - Tipos de productos (pasta roja, pasta blanca, porcelanico, etc.)
 * - Caracteristicas tecnicas (absorcion, resistencia, espesor, etc.)
 * - Usos recomendados por ubicacion y tipo de transito
 * - Guia de instalacion (doble encolado, adhesivos, juntas, tiempos)
 */

const CERAMIC_KNOWLEDGE = {
  // ==========================================
  // 1. TIPOS DE PRODUCTOS
  // ==========================================
  productTypes: {
    pastaBanca: {
      name: 'Pasta Blanca',
      description: 'Fabricada con arcillas sin oxidos (o muy bajo contenido). Color blanco o grisaceo.',
      characteristics: {
        waterAbsorption: 'Media (3-6%)',
        density: 'Media-Alta',
        resistance: 'Buena para interiores',
        aesthetics: 'Ideal para colores vivos y acabados rectificados',
      },
      ideal_for: [
        'Revestimientos de baños (paredes)',
        'Revestimientos de cocinas (paredes)',
        'Salones y dormitorios (paredes)',
        'Pavimentos interiores con transito moderado',
      ],
      not_suitable_for: [
        'Exteriores (sin proteccion)',
        'Zonas de alto transito comercial',
        'Piscinas',
        'Fachadas expuestas',
      ],
      price: 'Gama media - Excelente relacion calidad-precio',
      advantages: [
        'Menor porosidad que pasta roja',
        'Buena base para esmaltados',
        'Permite juntas muy finas (rectificado)',
        'Menor absorcion de agua que pasta roja',
      ],
    },
    pastaRoja: {
      name: 'Pasta Roja',
      description: 'Fabricada con arcillas ricas en oxidos (hierro, manganeso). Color rojizo/amarillento/marron tras la coccion.',
      characteristics: {
        waterAbsorption: 'Alta (6-10%)',
        density: 'Media',
        resistance: 'Moderada',
        aesthetics: 'Aspecto tradicional, calidez natural',
      },
      ideal_for: [
        'Revestimientos interiores (baños, cocinas)',
        'Paredes de dormitorios y salones',
        'Espacios con ambiente rustico o tradicional',
      ],
      not_suitable_for: [
        'Exteriores con ciclos hielo-deshielo',
        'Pavimentos con alto transito',
        'Zonas muy humedas (piscinas, fachadas)',
        'Proyectos que requieran juntas muy finas',
      ],
      price: 'Gama economica - Opcion mas accesible',
      advantages: [
        'Precio muy accesible',
        'Fácil de instalar',
        'Absorcion de agua (util para adhesion)',
        'Formatos variados, generalmente pequenos',
      ],
      limitations: [
        'Mayor porosidad = mayor riesgo de humedad en exteriores',
        'No apta para cambios bruscos de temperatura',
        'Menos durable que porcelanico',
      ],
    },
    porcelanico: {
      name: 'Gres Porcelanico',
      description: 'Material muy compacto, cocido a altas temperaturas (1200-1400 °C). Absorcion de agua minima (<0.5%).',
      characteristics: {
        waterAbsorption: 'Muy baja (<0.5%)',
        density: 'Muy alta',
        resistance: 'Excelente mecanica, desgaste, impactos y cambios termicos',
        aesthetics: 'Gran variedad de imitaciones (madera, piedra, marmol, hormigon)',
      },
      types: {
        tecnico: 'Mismo color en masa y superficie. Antideslizante, resistente a helada.',
        esmaltado: 'Capa de esmalte con gran variedad de colores y texturas.',
      },
      ideal_for: [
        'Pavimentos interiores y exteriores',
        'Revestimientos decorativos (interiores y exteriores)',
        'Baños (maxima resistencia al agua)',
        'Cocinas (facilidad de limpieza)',
        'Terrazas y piscinas',
        'Fachadas',
        'Zonas de alto transito (comercios, espacios publicos)',
        'Aplicaciones tecnicas (encineras, encimadas)',
      ],
      not_suitable_for: [
        'Nada significativo: es apto para casi cualquier uso',
      ],
      price: 'Gama premium - Mayor coste pero superior durabilidad',
      advantages: [
        'Absorcion casi nula = maxima resistencia al agua',
        'Alta resistencia al desgarre y impactos',
        'Resistencia a ciclos hielo-deshielo (apto exterior)',
        'Facilidad de limpieza',
        'Formatos grandes posibles (60x120, 75x150, laminas)',
        'Mayor durabilidad (hasta 20+ anos)',
        'Resistencia a agentes quimicos',
      ],
      limitations: [
        'Precio inicial mas elevado',
        'Requiere profesionales experimentados en instalacion (sobre todo gran formato)',
        'Necesita doble encolado y sistemas de nivelacion',
      ],
    },
    otros: {
      barroCocion: {
        name: 'Barro Cocido',
        description: 'Aspecto artesanal y rustico. Mayor porosidad.',
        ideal_for: ['Ambientes rusticos', 'Interiores tradicionales'],
        note: 'Requiere sellado en exteriores',
      },
      gresEsmaltado: {
        name: 'Gres Esmaltado',
        description: 'Solucion intermedia entre azulejo y porcelanico.',
        ideal_for: ['Pavimentos interiores', 'Transito moderado'],
      },
      extrusionado: {
        name: 'Extrusionado / Klinker',
        description: 'Muy baja absorcion. Resistencia extrema.',
        ideal_for: ['Exteriores', 'Terrazas', 'Piscinas', 'Clima riguroso'],
      },
      laminaPorcelanica: {
        name: 'Lamina Porcelanica (Gran Formato)',
        description: 'Espesor reducido, misma resistencia. Flexibilidad en instalacion.',
        ideal_for: ['Pavimentos grandes', 'Revestimientos', 'Encimeras', 'Proyectos modernos'],
      },
    },
  },

  // ==========================================
  // 2. CONCEPTOS TECNICOS CLAVE
  // ==========================================
  technicalConcepts: {
    absortionAguaWater: {
      concept: 'Absorcion de Agua',
      definition: 'Porcentaje de agua que absorbe la baldosa cuando entra en contacto con ella.',
      impact: 'Menor absorcion → Mayor densidad, dureza y resistencia. Mayor resistencia a humedad y helada.',
      ranges: {
        pastaBanca: '3-6%',
        pastaRoja: '6-10%',
        porcelanico: '<0.5% (casi nula)',
      },
      recommendation: 'Para exteriores y zonas humedas, elegir siempre <1% (porcelanico o similar).',
    },
    resistenciaMecanica: {
      concept: 'Resistencia Mecanica y Dureza',
      definition: 'Capacidad de la baldosa para soportar impactos, rayados y desgaste.',
      scales: {
        mohs: 'Escala de rayado (1-10): porcelanico suele estar en 7-8.',
        pei: 'Clasificacion PEI (desgarre superficial): importante para pavimentos.',
      },
      impactOnUse: 'Porcelanico tiene mayor resistencia → Apto para transito alto, zonas comerciales.',
      pastaRoja: 'Menor resistencia → Adecuada para interiores con transito moderado.',
    },
    espesor: {
      concept: 'Espesor',
      definition: 'Grosor de la baldosa.',
      typical: {
        revestimientos: '7-10 mm (mas finos)',
        pavimentos: '10-13 mm (mas gruesos)',
        granFormato: '11-20 mm (especialmente si es porcelanico)',
      },
      recommendation: 'En pavimentos con alto transito o formatos grandes, preferir espesores mayores.',
    },
    heladaAgentesQuimicos: {
      concept: 'Resistencia a Helada y Agentes Quimicos',
      definition: 'Capacidad de resistir ciclos hielo-deshielo y exposicion a quimicos.',
      suitable: [
        'Porcelanico (absorcion minima)',
        'Klinker / Extrusionado',
      ],
      notSuitable: [
        'Pasta roja sin proteccion',
        'Pasta blanca (aunque mejor que roja)',
      ],
      requirement: 'IMPRESCINDIBLE en exteriores con inviernos rigurosos, piscinas, fachadas.',
    },
  },

  // ==========================================
  // 3. RECOMENDACIONES POR UBICACION Y USO
  // ==========================================
  recommendationsByLocation: {
    interioresParedes: {
      location: 'Interiores - Paredes (Baños, Cocinas, Dormitorios, Salones)',
      recommended: [
        {
          type: 'Pasta Blanca',
          reason: 'Excelente relacion calidad-precio, facil instalacion, buena estetica',
        },
        {
          type: 'Pasta Roja',
          reason: 'Opcion economica, ambiente calidez',
        },
        {
          type: 'Porcelanico Esmaltado',
          reason: 'Maxima resistencia, facilidad de limpieza, durabilidad',
        },
      ],
      avoid: [
        'Exteriores sin proteccion',
      ],
    },
    banosCocinasRevestimientos: {
      location: 'Baños y Cocinas - Revestimientos (Paredes)',
      recommended: [
        {
          type: 'Pasta Blanca',
          reason: 'Ideal para humedades moderadas, colores vivos, rectificado',
        },
        {
          type: 'Porcelanico Esmaltado',
          reason: 'Mejor resistencia al agua y a manchas, mas duradero',
        },
      ],
      note: 'Evitar pasta roja pura en zonas muy humedas (aunque posible con sellado)',
      installation: 'Doble encolado recomendado en cocina para mayor seguridad',
    },
    banosCocinassuelo: {
      location: 'Baños y Cocinas - Suelos (Pavimentos)',
      recommended: [
        {
          type: 'Porcelanico Tecnico',
          reason: 'Absorcion minima, antideslizante, resistencia optima al agua',
        },
        {
          type: 'Gres Esmaltado',
          reason: 'Buena relacion calidad-precio, adecuado para transito moderado',
        },
      ],
      installation: 'Doble encolado y sistemas de nivelacion para porcelanico de gran formato',
      note: 'La humedad es critica: elegir siempre absorcion baja',
    },
    exterioresTerrazas: {
      location: 'Exteriores - Terrazas y Patios',
      recommended: [
        {
          type: 'Porcelanico Tecnico',
          reason: 'Resistencia a helada, absorcion nula, antideslizante',
        },
        {
          type: 'Klinker / Extrusionado',
          reason: 'Resistencia extrema a ciclos termicos y helada',
        },
      ],
      musts: [
        'Resistencia a helada certificada',
        'Antideslizante (seguridad)',
        'Absorcion <0.5%',
      ],
      avoid: [
        'Pasta roja o blanca sin proteccion',
        'Porcelanico esmaltado sin especificacion de exterior',
      ],
    },
    piscinasZonasHumedas: {
      location: 'Piscinas y Zonas Muy Humedas',
      recommended: [
        {
          type: 'Porcelanico Tecnico Antideslizante',
          reason: 'Cero absorcion, durabilidad, seguridad',
        },
        {
          type: 'Extrusionado Klinker',
          reason: 'Textura rugosa, maxima seguridad antideslizante',
        },
      ],
      critical: 'MUST: Absorcion <0.1%, certificacion de resistencia a cloro y agua salada',
      installation: 'Doble encolado obligatorio con adhesivo flexible C2TE S1',
    },
    fachadasExteriores: {
      location: 'Fachadas y Revestimientos Exteriores',
      recommended: [
        {
          type: 'Porcelanico Tecnico',
          reason: 'Resistencia a intemperie, helada, cambios termicos radicales',
        },
      ],
      requirements: [
        'Resistencia a ciclos hielo-deshielo',
        'Resistencia a radiacione UV',
        'Muy baja absorcion',
        'Resistencia a agentes quimicos (lluvia acida, contaminacion)',
      ],
      installation: 'Doble encolado, sistemas de nivelacion, juntas amplias (3-4 mm minimo)',
    },
    zonasAltTraffico: {
      location: 'Zonas de Alto Transito (Comercios, Hospitales, Espacios Publicos)',
      recommended: [
        {
          type: 'Porcelanico Tecnico PEI Alto',
          reason: 'Resistencia maxima al desgarre, durabilidad garantizada 10+ anos',
        },
      ],
      requirements: [
        'PEI minimo: 3-4 (transito comercial medio-alto)',
        'Resistencia a impactos',
        'Facilidad de limpieza',
      ],
      consideration: 'Formatos y colores que oculten suciedad (colores neutros, texturas)',
    },
  },

  // ==========================================
  // 4. GUIA DE INSTALACION
  // ==========================================
  installationGuide: {
    preparacionSoporte: {
      step: '1. Preparacion del Soporte',
      requirements: [
        'LIMPIO: Sin polvo, restos de material, grasa o humedad',
        'SECO: Humedad relativa <60%. En interiores, esperar 24h tras humedecer',
        'FIRME: Sin movimientos, grietas estructurales graves, o desprendimientos',
        'NIVELADO: Desniveles >3mm = nivelar con pasta niveladora o mortero',
      ],
      importance: 'Una mala preparacion es la causa #1 de desprendimientos posteriores',
    },
    dobleEncolado: {
      step: '2. Tecnica del Doble Encolado (RECOMENDADO para Porcelanico)',
      description: 'Aplicar adhesivo tanto en el soporte como en la trasera de la baldosa',
      process: [
        'Aplicar capa de adhesivo en el soporte con llana dentada (movimientos en angulo)',
        'Aplicar capa fina de adhesivo en la trasera de la baldosa con llana lisa',
        'Colocar la baldosa presionando con movimientos de rotacion (evita burbujas de aire)',
      ],
      benefits: [
        'Contacto casi total entre baldosa y soporte',
        'Evita bolsas de aire que causan desprendimientos posteriores',
        'Mayor durabilidad especialmente en grandes formatos',
      ],
      mandatory_for: [
        'Porcelanico (especialmente >60x120)',
        'Revestimientos verticales con peso',
        'Exteriores',
      ],
      optional_for: ['Pasta blanca si el soporte es perfecto'],
    },
    adhesivosRecomendados: {
      step: '3. Adhesivos Recomendados',
      types: [
        {
          name: 'C1 / C2 (Cemento Gris)',
          suitable_for: ['Pasta roja', 'Pasta blanca'],
          note: 'C2 es siempre preferible: mayor adhesion y flexibilidad',
        },
        {
          name: 'C2 Flexible',
          suitable_for: ['Pasta blanca en interiores con transito'],
          benefit: 'Mejor absorcion de movimientos',
        },
        {
          name: 'C2TE S1 (Flexible + Alto Rendimiento)',
          suitable_for: ['Porcelanico (RECOMENDADO)', 'Grandes formatos', 'Revestimientos'],
          benefit: 'Adhesion excelente, flexibilidad, tiempo de trabajabilidad amplio',
          critical: 'OBLIGATORIO para porcelanico de gran formato',
        },
        {
          name: 'C2TE S2 (Ultra-Premium)',
          suitable_for: ['Proyectos de maxima calidad', 'Formatos XXL'],
          benefit: 'Tiempo de trabajabilidad extendido',
        },
      ],
      rule: 'Si dudas: SIEMPRE elige C2TE S1 para porcelanico. Para pasta blanca/roja, minimo C2.',
    },
    sistemaDeNivelacion: {
      step: '4. Sistemas de Nivelacion (Para Grandes Formatos)',
      description: 'Evita desniveles visibles entre baldosas adyacentes',
      types: [
        'Crucetas plasticas (tradicional, bajo coste)',
        'Sistemas de nivelacion con cunas (precision mm, recomendado para >60x120)',
      ],
      mandatory_for: [
        'Porcelanico >60x120 cm',
        'Laminas porcelanicas',
        'Exteriores con alto valor estetico',
      ],
      benefit: 'Acabado profesional, evita tropiezos, facilita limpieza',
    },
    juntasYRejuntado: {
      step: '5. Juntas y Rejuntado',
      jointWidth: {
        regularFormats: '2-3 mm (formatos hasta 30x60)',
        largeFormats: '2-4 mm (formatos 60x120 en adelante)',
        largeExterior: '4+ mm (exteriores con porcelanico > 75x150)',
      },
      purpose: 'Las juntas permiten expansion/contraccion por temperatura y humedad. SON NECESARIAS.',
      rejuntadoProcess: [
        'Esperar adhesivo completamente seco (minimo 24h, mejor 48h en porcelanico)',
        'Rellenar juntas con lechada adecuada (couleur / pintura del color deseado)',
        'Usar llana de goma con movimiento diagonal (no vertical/horizontal)',
        'Limpiar exceso con esponja humeda ANTES de que endurezca (30-60 min)',
      ],
      finishing: [
        'Dejar secar lechada 24-48h',
        'Eliminar velo de obra con limpiador especifico para ceramica/porcelanico',
      ],
    },
    tiemposDeSeco: {
      step: '6. Tiempos de Secado (CRITICOS)',
      adhesive_drying: {
        tiempo: 'MINIMO 24 horas (mejor 48-72h en porcelanico o clima frio/humedo)',
        definition: 'Antes de rejuntar, el adhesivo debe estar COMPLETAMENTE seco',
        consequence: 'Si rejuntas antes, puedes desplazar baldosas o crear bolsas de aire',
      },
      grout_drying: {
        tiempo: '24-48 horas antes de transito ligero',
        timeForHeavy: '72+ horas antes de muebles pesados o alto transito',
        exterior: 'En exteriores: esperar 5-7 dias en invierno (frio retrasa secado)',
      },
      humidity_cold: 'Humedad relativa alta o temperaturas bajas RETRASAN mucho el secado. Ir siempre al lado conservador.',
      rule_of_thumb: 'Cuando dudes, espera mas dias. El secado prematuro es irreversible.',
    },
    colocacionSobrePavimentoExistente: {
      step: '7. Colocacion sobre Pavimento Existente',
      conditions: [
        'SUELO ANTIGUO DEBE ESTAR: Firme, limpio, nivelado (nivelar si hay desniveles >5mm)',
        'SIN HUMEDAD: Prueba de humedad <2.5% con humidimetro',
        'SIN DESPRENDIMIENTOS: Golpear suelo antiguo; debe sonar solido (no hueco)',
      ],
      process: [
        'Limpiar bien todo (quitar grasa, sellador viejo, etc)',
        'Aplicar imprimacion de agarre especifica (mejora adhesion)',
        'Usar adhesivo flexible apto para sobre-pavimento',
        'Doble encolado OBLIGATORIO',
      ],
      risk: 'Mayor riesgo de desprendimientos con el tiempo. Solo si el suelo antiguo es muy solido.',
    },
  },

  // ==========================================
  // 5. CRITERIOS DE ELECCION RAPIDA
  // ==========================================
  quickSelectionGuide: {
    byBudget: {
      economico: {
        budget: 'Bajo presupuesto',
        choice: 'Pasta Roja (revestimientos)',
        note: 'Valido para interiores, no exteriores',
      },
      intermedio: {
        budget: 'Presupuesto medio',
        choice: 'Pasta Blanca (mejor calidad-precio)',
        note: 'Ideal relacion calidad-durabilidad',
      },
      premium: {
        budget: 'Alto presupuesto',
        choice: 'Porcelanico (maxima durabilidad)',
        note: 'Apto para cualquier ubicacion, durabilidad 20+ anos',
      },
    },
    byLocation: {
      bathroom: {
        location: 'Baño (Paredes + Suelo)',
        walls: 'Pasta Blanca o Porcelanico Esmaltado',
        floor: 'Porcelanico Tecnico Antideslizante',
        reason: 'Maxima resistencia al agua y humedad',
      },
      kitchen: {
        location: 'Cocina (Paredes + Suelo)',
        walls: 'Pasta Blanca o Porcelanico',
        floor: 'Porcelanico Tecnico (facilidad de limpieza)',
        installation: 'Doble encolado en revestimientos por seguridad',
      },
      livingRoom: {
        location: 'Salon / Dormitorio (Paredes + Suelo)',
        walls: 'Pasta Roja o Blanca (presupuesto decidira)',
        floor: 'Gres Esmaltado o Porcelanico segun transito',
        reason: 'Menor exigencia tecnica = mayor flexibilidad presupuestaria',
      },
      terrace: {
        location: 'Terraza / Patios Exteriores',
        choice: 'Porcelanico Tecnico o Klinker',
        musts: [
          'Resistencia a helada',
          'Absorcion <0.5%',
          'Antideslizante',
        ],
      },
      pool: {
        location: 'Piscina / Zonas Muy Humedas',
        choice: 'Porcelanico Tecnico Antideslizante',
        critical: 'Cero absorcion, resistencia a cloro',
      },
      commercial: {
        location: 'Comercio / Espacio Publico (Alto Transito)',
        choice: 'Porcelanico Tecnico PEI 3-4',
        requirement: 'Resistencia maxima, durabilidad garantizada',
      },
      facade: {
        location: 'Fachada / Revestimiento Exterior',
        choice: 'Porcelanico Tecnico',
        requirements: 'Resistencia a intemperie, helada, UV',
      },
    },
  },

  // ==========================================
  // 6. RESPUESTAS A PREGUNTAS FRECUENTES
  // ==========================================
  faqAnswers: {
    pastaRojaVsBlanca: {
      question: '¿Cual es la diferencia entre pasta roja y pasta blanca?',
      answer: `La **pasta roja** es mas porosa, absorbe mas agua, es mas economica y ideal para interiores basicos.
La **pasta blanca** es menos porosa, mejor base para colores vivos, permite juntas finas y tiene mejor relacion calidad-precio.
Para baños/cocinas, pasta blanca es casi siempre mejor opcion.`,
    },
    porcelanicaExteriores: {
      question: '¿Puedo poner pasta blanca en la terraza?',
      answer: `Pasta blanca en exterior NO es recomendable sin proteccion extra.
El porcelanico es la opcion correcta para exteriores: absorcion minima, resistencia a helada garantizada.
Si presupuesto es critico, minimo usar gres esmaltado apto para exterior, pero porcelanico es lo seguro.`,
    },
    dobleEncolado: {
      question: '¿Como se instala porcelanico? ¿Necesito doble encolado?',
      answer: `SI, doble encolado es RECOMENDADO (casi obligatorio para formatos >60x120).

Proceso:
1. Aplicar adhesivo en soporte con llana dentada
2. Aplicar capa fina en trasera de baldosa con llana lisa
3. Presionar con rotacion para evitar burbujas

Beneficio: evita desprendimientos, asegura contacto total.
Adhesivo recomendado: C2TE S1 (flexible, alto rendimiento).`,
    },
    tiemposSecado: {
      question: '¿Cuanto tiempo esperar antes de rejuntar?',
      answer: `Adhesivo: MINIMO 24 horas (mejor 48-72h en porcelanico o clima frio).
Lechada: Dejar secar 24-48h antes de pisarlo, 72h si hay cargas pesadas.

Regla de oro: CUANDO DUDES, ESPERA MAS DIAS.
Humedad alta o frio retrasan mucho el secado. No confies solo en fecha calendario.`,
    },
    suloAltoTraffico: {
      question: '¿Que tipo de suelo me recomiendas para un comercio con mucho transito?',
      answer: `PORCELANICO TECNICO con PEI minimo 3-4.
Razon: resistencia maxima al desgarre, durabilidad garantizada 10+ anos.

Especificaciones:
- Absorcion <0.5% (facilidad de limpieza)
- PEI 3-4 (resistencia a rayado/transito)
- Color neutro (disimula suciedad)
- Formatos estandar (facilita reposicion si hay danos)`,
    },
    adhesivosRecomendados: {
      question: '¿Que adhesivo debo usar?',
      answer: `Regla simple:
- Pasta Roja/Blanca: Minimo C2 (preferible C2 flexible)
- Porcelanico: C2TE S1 RECOMENDADO (flexible + alto rendimiento)

C2TE S1 es la opcion segura para cualquier cosa. Si no sabes, usa eso.
Evitar adhesivos viejos, secos o de baja calidad.`,
    },
  },

  // ==========================================
  // 7. CONTEXTO PARA CLAUDE
  // ==========================================
  claudeContextSummary: `CONOCIMIENTO TECNICO DE CERAMICA - RESUMEN PARA ASISTENTE IA

TIPOS DE PRODUCTOS:
1. Pasta Roja: Economica, porosa, ideal interiores, NO exterior
2. Pasta Blanca: Mejor que roja, menos porosa, excelente relacion calidad-precio
3. Porcelanico: Premium, absorcion casi nula, apto TODO (interior/exterior)

DIFERENCIA CLAVE - ABSORCION DE AGUA:
- Pasta Roja: 6-10% (alto riesgo en exteriores/humedad)
- Pasta Blanca: 3-6% (segura interiores)
- Porcelanico: <0.5% (seguro exterior, piscinas, humedad maxima)

RECOMENDACIONES RAPIDAS:
- Baño/Cocina: Pasta Blanca (paredes) + Porcelanico (suelo)
- Exterior/Terraza: Porcelanico obligatorio
- Piscina: Porcelanico antideslizante obligatorio
- Comercio alto transito: Porcelanico PEI 3-4
- Presupuesto bajo: Pasta Roja (solo interior)

INSTALACION CLAVE:
- Doble encolado para porcelanico (adhesivo + baldosa)
- Adhesivo recomendado: C2TE S1 para porcelanico
- Tiempos secado: MINIMO 24-48h antes de rejuntar
- Sistemas de nivelacion para formatos >60x120
- Preparar soporte: LIMPIO, SECO, NIVELADO

ERRORES COMUNES A EVITAR:
- Pasta roja en exterior sin proteccion (helada destroza)
- Rejuntar antes de 24h (desplaza baldosas)
- No preparar bien el soporte (cause #1 desprendimientos)
- Usar adhesivo barato para porcelanico grande (falla)
- Ignorar juntas (provocan agrietamientos termicos)`,
};

module.exports = CERAMIC_KNOWLEDGE;
