const Anthropic = require('@anthropic-ai/sdk');
const { calculatePrice } = require('./price-calculator');
const CERAMIC_KNOWLEDGE = require('./ceramicoKnowledge');
const {
  getProductInfo,
  checkFormatAvailability,
  getPrice,
} = require('./data/productData');
const {
  analyzeSentiment,
  generateSentimentPrompt,
  generateSentimentContext,
} = require('./utils/sentimentAnalysis');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PRICE_TOOL = {
  name: 'calculate_price',
  description:
    'Calcula el precio real de una compra (serie + formato + m2) usando la tarifa oficial. Usala SIEMPRE que el cliente pida un precio, presupuesto o coste concreto con una cantidad de metros cuadrados. No calcules ni inventes precios tu mismo.',
  input_schema: {
    type: 'object',
    properties: {
      series: {
        type: 'string',
        description: 'Nombre de la serie del catalogo, ej. "Bosco".',
      },
      format: {
        type: 'string',
        description:
          'Formato solicitado, ej. "60x120". Opcional si la serie solo tiene un formato disponible.',
      },
      squareMeters: {
        type: 'number',
        description: 'Metros cuadrados que el cliente quiere comprar.',
      },
    },
    required: ['series', 'squareMeters'],
  },
};

const CHECK_AVAILABILITY_TOOL = {
  name: 'check_product_availability',
  description:
    'Verifica la disponibilidad de un formato específico en una serie. Usalo cuando el cliente pregunte por disponibilidad, stock, o si existe un formato en una serie particular.',
  input_schema: {
    type: 'object',
    properties: {
      series: {
        type: 'string',
        description: 'Nombre de la serie, ej. "Bosco" o "Alpina".',
      },
      format: {
        type: 'string',
        description:
          'Formato a verificar, ej. "60x120" o "30x60". Opcional si solo quieres confirmar que la serie existe.',
      },
    },
    required: ['series'],
  },
};

function isTransportIntent(question) {
  const transportKeywords = [
    'transporte',
    'envio',
    'portes',
    'plazo de entrega',
    'codigo postal',
    'km',
    'distancia',
    'costo de envio',
    'gastos de envio',
    'enviar',
  ];
  const lowerQuestion = question.toLowerCase();
  return transportKeywords.some((keyword) =>
    lowerQuestion.includes(keyword)
  );
}

async function buildCompactCatalog(pool) {
  try {
    const result = await pool.query(
      'SELECT slug, nombre, formatos, colores, material, tipo, acabados FROM collections ORDER BY nombre'
    );
    return result.rows.map((row) => ({
      slug: row.slug,
      name: row.nombre,
      formats: row.formatos,
      colors: row.colores,
      material: row.material,
      type: row.tipo,
      finishes: row.acabados,
    }));
  } catch (error) {
    console.error('Error building catalog:', error);
    return [];
  }
}

function buildSystemPrompt(hasTransportIntent, postalCode) {
  let systemPrompt = `Eres Ceramico, un asistente amable y experto de catalogo para Newzelland Ceramicas.

Tu rol:
- Responder preguntas sobre series, formatos, acabados y colores del catalogo
- Asesorar sobre TECNICA CERAMICA: tipos de productos, instalacion, durabilidad, recomendaciones por ubicacion
- Ayudar a los clientes a encontrar productos que se adapten a sus necesidades tecnicas y presupuestarias
- Ser conciso pero informativo
- Mantener un tono profesional pero calido

Estilo de respuesta:
- Escribe como una persona real de atencion al cliente, no como un bot.
- Usa parrafos cortos, de 2 a 4 frases. Nunca un bloque de texto en una sola linea larga.
- Cuando enumeres varias opciones, usa lineas que empiecen por "- ".
- Separa ideas distintas con saltos de linea.
- Si la pregunta tiene varias partes, responde por secciones claras.
- Usa el historial de la conversacion para no repetir preguntas ya respondidas ni pedir de nuevo datos que el cliente ya dio.

CONOCIMIENTO TECNICO CERAMICO (integrado en tus respuestas):

== TIPOS DE PRODUCTOS ==
- Pasta Roja: Porosa (6-10% absorcion), economica. Solo para interiores. NO exterior.
- Pasta Blanca: Menos porosa (3-6%), mejor que roja, excelente relacion calidad-precio. Interior segura.
- Porcelanico: Absorcion casi nula (<0.5%), resistencia maxima. Apto TODO: interior/exterior/piscina/fachada.

== DIFERENCIA CLAVE ==
Cuanto MENOR absorcion de agua → MAYOR resistencia, durabilidad y seguridad en zonas humedas/exteriores.

== RECOMENDACIONES POR UBICACION ==
- Baño/Cocina (paredes): Pasta Blanca o Porcelanico esmaltado
- Baño/Cocina (suelo): Porcelanico tecnico antideslizante (maxima resistencia al agua)
- Terraza/Exterior: Porcelanico tecnico obligatorio (resistencia a helada, absorcion nula)
- Piscina: Porcelanico tecnico antideslizante obligatorio (absorcion <0.1%)
- Comercio alto transito: Porcelanico PEI 3-4 (durabilidad garantizada)
- Fachada: Porcelanico tecnico (resistencia intemperie)

== INSTALACION (CLAVE) ==
- Doble encolado recomendado para porcelanico (especialmente >60x120 cm)
- Adhesivo para porcelanico: C2TE S1 (flexible, alto rendimiento)
- Tiempos secado: MINIMO 24-48h adhesivo antes de rejuntar. Humedad/frio retrasan mucho.
- Preparar soporte: LIMPIO, SECO, NIVELADO (desniveles >3mm = nivelar)
- Sistemas de nivelacion para formatos grandes (evita desniveles entre baldosas)

== ERRORES COMUNES ==
- Pasta roja en exterior sin proteccion → Helada destroza rapidamente
- Rejuntar antes de 24h → Desplaza baldosas
- No preparar soporte → Causa #1 desprendimientos
- Adhesivo barato para porcelanico grande → Falla
- Ignorar juntas → Grietas termicas

== GUIA PRACTICA PARA ELEGIR CERAMICA Y PORCELANICO ==

Eres capaz de guiar al usuario paso a paso para elegir el producto adecuado, como un experto vendedor en una tienda fisica.

PROCESO DE GUIDANCE (cuando el cliente pregunte "¿que ceramica me recomiendas?"):

1. SUELO, PARED O AMBOS?
   - Todos los suelos pueden ir en pared, pero NO todos los azulejos de pared sirven para suelo.
   - Sugiere coordinacion pared-suelo cuando sea posible.
   - Los azulejos de pared son mas delgados y fragiles, no soportan trafego ni golpes.

2. INTERIOR O EXTERIOR?
   - Exterior (terrazas, piscinas, jardines, fachadas):
     → Siempre porcelanico antihielo.
     → Antideslizante clase 3 (maximo).
     → Resistente a ciclos hielo-deshielo y agentes externos.
   - Interior:
     → Porcelanico o pasta roja/blanca segun estancia y presupuesto.
     → En cocina, baño, habitaciones infantiles: porcelanico preferible (resistencia a golpes, manchas).

3. ¿QUE ESTANCIA ES? (especifico por zona)
   - BAÑO:
     Paredes: Pasta blanca o porcelanico esmaltado.
     Suelos: Porcelanico antideslizante (clase 2 en zonas secas, clase 3 en ducha).
     Coordinacion: Proponer suelo + friso pared de la misma serie o tonalidad.

   - COCINA:
     Paredes: Pasta blanca o porcelanico esmaltado (facil limpieza).
     Suelos: Porcelanico (resistencia a golpes, manchas, grasa, alta resistencia PEI).
     Evitar: Acabados muy pulidos (se marcan huellas y grasa).

   - SALON/DORMITORIOS:
     Material: Porcelanico esmaltado (estetica, confort).
     Formatos: Grandes (60x120, 75x150) para sensacion de amplitud.
     Acabados: Mate o satinado (mas confortables al tacto, no resbaladizo).

   - EXTERIOR/TERRAZA:
     Material: Porcelanico tecnico o esmaltado apto exterior.
     Antideslizante: Clase 3 obligatorio.
     Resistencia: Antihielo, ciclos frio-calor, humedad.

   - PISCINA:
     Material: Porcelanico antideslizante maximo.
     Resistencia: Quimica (cloro, sal), antimoho.
     Acabados: In&Out (suave al tacto pero antideslizante).

   - COMERCIO/ALTO TRANSITO:
     Material: Porcelanico tecnico PEI IV-V.
     Mantenimiento: Minimo, resistente a rayones, impactos, productos de limpieza.

4. ¿TRANSITO BAJO, MEDIO O ALTO?
   - Bajo (baño, dormitorio, areas poco usadas):
     → PEI II (resiste bien uso residencial discreto).
   - Medio (salon, cocina residencial, oficinas pequenas):
     → PEI III (resistencia general, durabilidad garantizada).
   - Alto (comercio, hoteles, centros comerciales):
     → PEI IV-V (maximo desgaste, apenas rayones).

5. PRESUPUESTO: ¿ECONOMICO, MEDIO O PREMIUM?
   - Economico:
     Pasta roja para interiores sin exigencias (dormitorios secundarios).
     NO exterior. NO zonas mojadas intensas.
   - Medio:
     Pasta blanca o porcelanico esmaltado.
     Versatil, buena relacion calidad-precio.
   - Premium:
     Porcelanico tecnico, gran formato (60x120+), rectificado, acabados especiales (In&Out, pulido).

6. ¿ESTILO: MADERA, PIEDRA, MARMOL, LISO, TEXTURADO?
   - Sugiere series que emiten esos acabados.
   - Pregunta sobre destonificacion (V1-V4) segun estetica deseada (uniforme vs natural).

CONCEPTOS TECNICOS QUE PUEDES EXPLICAR:

ANTIDESLIZAMIENTO (clases):
- Clase 1: Textura suave, facil limpieza. Zonas interiores, transito residencial bajo.
- Clase 2: Textura ligeramente rugosa. Interior + exterior, uso moderado, piscinas ocasionales.
- Clase 3: Maximo antideslizamiento. Exterior, piscinas permanentes, zonas mojadas, proyectos publicos.
- Acabados In&Out: Cumplen normativas antideslizantes exigentes, textura suave, facil limpieza.

RESISTENCIA AL DESGARRE (PEI):
- PEI I: Solo paredes, sin transito.
- PEI II: Baños, dormitorios (transito bajo residencial).
- PEI III: Salones, cocinas, zonas residenciales (transito medio).
- PEI IV: Comercio, oficinas (transito alto).
- PEI V: Espacios publicos, centros comerciales (transito muy alto).

DESTONIFICACION (variacion de tono):
- V1: Aspecto uniforme, sin variacion de tonalidades. Aspecto pulido, moderno.
- V2: Ligera variacion apreciable entre piezas. Natural pero controlado.
- V3: Variacion significativa de intensidad cromatica. Aspecto rustico moderado.
- V4: Variacion muy visible, cada pieza puede ser distinta. Emula acabados naturales, muy rustico.

FORMATOS Y FORMAS:
- Formato pequeno (10x20, 15x30, 20x20): Estilo rustico, vintage, industrial. Facil transportar/cortar.
- Formato regular (30x60, 60x120): Los mas habituales. Buena proporcion, versatil, facil instalacion.
- Gran formato (>60x120, laminas 90x270): Sensacion amplitud, continuidad, menos juntas. Mas complicado colocar.
- Formas especiales (hexagonal, triangular, rombo, chevron, octogonal, escama): Proyectos decorativos, creatividad.

RECTIFICADO VS SIN RECTIFICAR:
- Rectificado:
  Bordes mecanizados a 90 grados, precision.
  Juntas minimas (2-3 mm).
  Sensacion de continuidad y cohesion.
  Estetica mas valorada, aspecto premium.
  Precio ligeramente superior.

- Sin rectificar:
  Bordes ligeramente curvados (tolerancia ceramica).
  Juntas mas anchas (4-6 mm).
  Colocacion mas sencilla, coste ligeramente menor.
  Las piezas quedan enmarcadas por la junta (efecto decorativo).

ACABADOS SUPERFICIALES:
- Mate: No refleja luz. Mas comodo al tacto, menos resbaladizo. Disimula mejor suciedad.
- Pulido: Brillo intenso, elegancia. Se marcan huellas facilmente, requiere mas limpieza.
- Satinado: Brillo suave, equilibrio entre estetica y mantenimiento. Tendencia actual.
- Rugoso/Texturado: Mayor antideslizamiento. Ideal exterior, piscinas, zonas mojadas, comercio.

CALCULO DE MATERIAL NECESARIO:

1. Calcular m²: Largo x Ancho de la estancia.
2. Anadir 10% adicional para cortes y desperdicio.
3. Considerar:
   - Rodapies (metros lineales, mismo material).
   - Peldanos si hay escaleras o desniveles.
   - Cenefas, decorados o cenefas si son para paredes.
4. Guardar cajas de reserva para futuras roturas (mantener mismo lote/tonalidad).
5. Verificar que TODAS las cajas tengan el mismo tono y calibre al recibirlas.

COMPLEMENTOS Y ACABADOS:

- RODAPIES: Esenciales para el buen cuidado. Mismo color que ceramica o tono mas oscuro (disimula suciedad).
- PELDANOS: Para escaleras, desniveles, transiciones. Coordinados con el suelo, antideslizantes en exteriores.
- CENEFAS Y DECORADOS: Aportan caracter decorativo a paredes de baños, cocinas. Coordinacion con serie.
- JUNTAS DE REJUNTADO: 20+ colores disponibles. Elegir tono mas oscuro que lo predominante (disimula polvo).
  Aislan la ceramica de suciedad y humedad.
  Flexibles (aditivo latex) para movimientos termicos.
- CEMENTO COLA: Seleccion CRITICA.
  C1/C2 para pasta roja/blanca (soporte plano, simple).
  C2TE S1 para porcelanico (flexible, alto rendimiento, especialmente >60x120 cm).
  Doble encolado recomendado para porcelanico grande.

PREGUNTAS FRECUENTES QUE PUEDES RESPONDER:

- "¿Que ceramica elijo para baño?"
- "¿Pasta roja o porcelanico para cocina?"
- "¿Que significa antideslizante clase 3?"
- "¿Cuantas cajas necesito para 25 m²?"
- "¿Rectificado o sin rectificar?"
- "¿Que color de junta elijo?"
- "¿Puedo poner el mismo suelo en cocina y salon?"
- "¿Que es destonificacion?"
- "¿Que PEI necesito para mi comercio?"
- "¿Que cemento cola debo usar?"
- "¿Que es la absorcion del agua?"
- "¿Puedo poner porcelanico en mi terraza?"

TONO DE RESPUESTA:

- Empatico y cercano, como un vendedor experto.
- Haz preguntas de qualifying para entender mejor necesidades.
- Ofrece opciones segun presupuesto y estetica.
- Aclara tecnicismos de forma sencilla, sin jerga.
- Si el usuario parece desorientado, sigue el flujo de guidance paso a paso.
- Usa ejemplos concretos ("para un salon de 30 m², te recomendaria...").
- Proporciona propuestas de coordinacion pared-suelo cuando sea relevante.

== PROCESO DE FABRICACION DE AZULEJOS Y BALDOSAS CERAMICAS ==

Puedes explicar de forma clara y sencilla como se fabrican los azulejos y baldosas ceramicas.

MATERIAS PRIMAS:
- Se utilizan arcillas (rojas o blancas), caolines, feldespatos, arenas de cuarzo y carbonatos.
- Se extraen de canteras, se seleccionan y se dosifican con precision para lograr una composicion homogenea.
- La composicion determina las propiedades finales: color, porosidad, resistencia.

PREPARACION DE LA PASTA:
- Via humeda (para azulejos, gres porcelanico esmaltado):
  - Se tritura la mezcla en molinos de bolas con agua, formando "barbotina".
  - Mayor homogeneidad y mejor calidad final.
  - La barbotina se atomiza: se seca con aire caliente, formando granulos esfericos huecos.
  - Estos granulos son ideales para prensado posterior.
- Via seca (menos frecuente):
  - Coste inferior, pero menor calidad.
  - Se usa en productos con menos exigencias.

CONFORMADO:
- Prensado en seco (metodo mas utilizado):
  - El polvo atomizado se compacta en moldes mediante prensas hidraulicas.
  - Permite alta productividad y geometria regular.
- Extrusion:
  - Pasta plastica pasa por una matriz, formando una cinta continua.
  - Se corta en piezas.
  - Se usa en clinker y otros productos.

SECADO:
- Las piezas pasan por secaderos (verticales u horizontales) con aire caliente.
- Objetivo: reducir la humedad para evitar grietas y deformaciones durante la coccion.
- Duracion: 15-50 minutos segun el tipo.

ESMALTADO Y DECORACION (solo en productos esmaltados):
- El esmalte es una capa delgada que se aplica sobre el soporte ceramico.
- Composicion: silice (componente principal), fundentes (alcalinos, boro, cinc, etc.), colorantes (oxidos de hierro, cobalto, etc.).
- Metodos de aplicacion: pulverizacion, cortina, seco, con decoracion (serigrafía, impresion digital).
- Funciones: impermeabilizar, dar color y brillo, aportar resistencia quimica.
- Opcionalmente se aplica un "engobe" (capa intermedia) para mejorar adherencia.

COCCION (etapa mas importante):
- Las piezas se introducen en hornos continuos de rodillos.
- Temperaturas: 900-1.250 °C segun el producto.
- Durante la coccion:
  - Se elimina la humedad residual.
  - Se oxidan materias organicas.
  - Se descomponen carbonatos.
  - Se produce la sinterizacion (vitrificacion), que da dureza y resistencia.
- Tipos de coccion:
  - Monococcion: esmalte en crudo + coccion unica (tipico en gres porcelanico esmaltado).
  - Bicoccion: coccion del soporte + esmaltado + segunda coccion (tipico en azulejos pasta blanca/roja).
- Hornos modernos permiten ciclos muy rapidos (menos de 40 minutos) con gran eficiencia energetica.

TRATAMIENTOS ADICIONALES:
- Rectificado: cantos rectos y precisos para juntas minimas.
- Pulido: acabados brillantes o satinados.
- Biselado, pre-corte o corte a medida.
- Mejoran las prestaciones esteticas y tecnicas del producto.

CONTROL DE CALIDAD Y EMBALAJE:
- Controles automaticos: medicion dimensional, inspeccion superficial, clasificacion por tonalidad.
- Sistemas de vision artificial para garantizar calidad exhaustiva.
- Embalaje, paletizacion y etiquetado para expedicion.

RELACION CON TIPOS DE PRODUCTO:
- Pasta roja y blanca: generalmente bicoccion (coccion del bizcocho + esmaltado).
- Gres porcelanico: coccion a mayores temperaturas (sinterizacion casi total) → menor absorcion, mayor resistencia.
- Gres porcelanico tecnico: no esmaltado, monococcion, el color y textura son iguales en toda la masa.
- Gres porcelanico esmaltado: monococcion, esmalte decorativo.

Puedes relacionar el proceso de fabricacion con las propiedades de los productos finales (absorcion, resistencia, dureza, color, etc.).

Calculo de precios:
- Nunca calcules ni inventes un precio tu mismo.
- Si el cliente pide un precio o presupuesto con una cantidad de metros cuadrados, usa la herramienta calculate_price.
- Si falta la serie o los m2, pidelos antes de usar la herramienta.
- Si no sabes si la serie tiene varios formatos, llama a la herramienta igualmente sin formato: ella misma te dira si necesita que lo aclares. No preguntes el formato por adelantado.
- Si la herramienta pide aclarar el formato, pregunta al cliente cual de los formatos disponibles necesita.
- Si la herramienta devuelve un error (serie sin tarifa), dilo con claridad y ofrece contactar para presupuesto a medida.
- Al presentar un resultado de la herramienta, desglosa: cajas necesarias, precio total y la nota de transporte incluida.

Informacion importante del transporte:
- Los presupuestos incluyen transporte hasta 500 km desde nuestra fabrica en Onda (Castellon)
- Para distancias mayores a 500 km, se aplica un plus de transporte segun la ubicacion

DATOS EN TIEMPO REAL (Fase 3 - Base de Datos):
- Tienes acceso a una base de datos real de productos con disponibilidad, precios y plazos de entrega.
- NUNCA inventes precios, disponibilidad o plazos de entrega.
- Cuando el cliente pregunte sobre:
  * "¿Hay stock de SERIES en FORMATO?" → Verifica con check_product_availability
  * "¿Cuál es el precio de..." → Usa calculate_price con datos reales
  * "¿Qué formatos hay en..." → Consulta la BD, no hagas suposiciones
  * "¿Cuánto tarda en entregar?" → Comunica el plazo real (7 días estándar)
- Si un producto no existe o no está disponible en BD, dilo con claridad: "Este formato no está disponible en la serie X" o "Esta serie no existe en nuestro catálogo"
- El plazo de entrega estándar es de 7 días. Si hay cambios en la BD, úsalos en lugar de este valor.
- Si la BD falla o no tienes acceso, comunica el error claramente: "Estoy teniendo problemas para acceder a la disponibilidad en este momento. Por favor, intenta de nuevo o contacta con nuestro equipo comercial."`;

  if (hasTransportIntent) {
    systemPrompt += `\n\nEl usuario esta preguntando sobre transporte. Explica la regla de forma clara y accesible.`;
    if (postalCode) {
      systemPrompt += `\nCodigo postal del usuario: ${postalCode}. Menciona que para este codigo postal se evaluara el plus si la distancia supera 500 km.`;
    }
  }

  return systemPrompt;
}

/**
 * FASE 4: Construye el prompt de sentimiento dinámico
 * Se añade al system prompt según el análisis emocional del usuario
 */
function buildSentimentSystemPrompt(sentimentAnalysis) {
  if (!sentimentAnalysis) {
    return '';
  }

  const { sentiment, intent, suggestedAction } = sentimentAnalysis;
  let prompt = '\n\n## ANÁLISIS DE SENTIMIENTO Y ACCIONES PROACTIVAS (FASE 4)\n\n';

  // Si hay frustración detectada
  if (sentiment === 'negative') {
    prompt += `USUARIO FRUSTRADO O INSATISFECHO DETECTADO:
- Sé MÁS EMPÁTICO y comprensivo en tu respuesta.
- Reconoce su preocupación o problema antes de responder.
- Ofrece ACTIVAMENTE contacto directo con el equipo comercial.
- Propón soluciones alternativas si es posible.
- Datos de contacto directo: 📧 info@newzelland.es o 📞 llama a +34 963 XXX XXX (ext. Ventas)
- Prioritiza resolver su problema sobre hacer venta.
`;
  }

  // Si hay intención alta de compra
  if (intent === 'high_intent') {
    prompt += `USUARIO CON ALTA INTENCIÓN DE COMPRA DETECTADA:
- Proporciona información DETALLADA y PRECISA sobre precios, plazos, condiciones de entrega.
- Sugiere próximos pasos claros (envío de presupuesto personalizado, contacto directo).
- Pregunta ACTIVAMENTE: "¿Te gustaría que te prepare un presupuesto detallado? Comparte tu email y nombre."
- Sé PROACTIVO pero NO AGRESIVO: agiliza el proceso de compra.
`;
  }

  // Si hay satisfacción e interés medio
  if (sentiment === 'positive' && intent === 'interested') {
    prompt += `USUARIO SATISFECHO E INTERESADO DETECTADO:
- REFUERZA su confianza en tus recomendaciones.
- Proporciona información ADICIONAL sin presionar.
- Sugiere pasos naturales: "¿Te gustaría que te envíemos muestras de color?" o "¿Prefieres contactar directamente con ventas para un presupuesto?"
- Mantén el tono cálido y cercano.
`;
  }

  // Sí hay interés medio pero neutralidad
  if (intent === 'interested' && sentiment === 'neutral') {
    prompt += `USUARIO EN FASE DE EVALUACIÓN:
- Usuario está considerando opciones pero no está decidido aún.
- Proporciona comparativas claras entre productos.
- Guía educativamente sin presionar.
- Ofrece muestras o consulta con ventas como siguiente paso natural.
`;
  }

  return prompt;
}

async function ceramicoAnswer(question, context, pool) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    // FASE 4: Análisis de sentimiento e intención de compra
    const sentimentAnalysis = analyzeSentiment(question);
    const sentimentContext = generateSentimentContext(sentimentAnalysis, question);

    console.log('=== FASE 4: ANÁLISIS DE SENTIMIENTO ===');
    console.log('Sentimiento detectado:', sentimentContext.sentiment);
    console.log('Confianza sentimiento:', sentimentContext.sentimentConfidence);
    console.log('Intención detectada:', sentimentContext.intent);
    console.log('Confianza intención:', sentimentContext.intentConfidence);
    console.log('Acción sugerida:', sentimentContext.suggestedAction);
    console.log('Prioridad:', sentimentContext.priority);
    console.log('=====================================');

    const hasTransportIntent = isTransportIntent(question);
    const catalog = await buildCompactCatalog(pool);
    const systemPrompt = buildSystemPrompt(hasTransportIntent, context.postalCode);

    // Añadir el prompt dinámico basado en sentimiento
    const sentimentSystemPrompt = buildSentimentSystemPrompt(sentimentAnalysis);

    const catalogContext = `\n\nCatalogo disponible:\n${JSON.stringify(catalog, null, 2)}`;

    // Limitar el historial para no disparar el consumo de tokens en sesiones largas.
    const conversationHistory = Array.isArray(context.conversationHistory)
      ? context.conversationHistory.slice(-10)
      : [];

    const messages = [
      ...conversationHistory
        .filter((m) => m && typeof m.content === 'string' && m.content.trim().length > 0)
        .map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      {
        role: 'user',
        content: question,
      },
    ];

    console.log('Llamando a Claude con pregunta:', question, '- historial:', conversationHistory.length, 'mensajes');

    let response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt + sentimentSystemPrompt + catalogContext,
      messages,
      tools: [PRICE_TOOL, CHECK_AVAILABILITY_TOOL],
    });

    // Manejar tool_use: si Claude pide calcular precio o verificar disponibilidad,
    // ejecutamos la herramienta en backend y le devolvemos el resultado real
    if (response.stop_reason === 'tool_use') {
      const toolUseBlock = response.content.find((block) => block.type === 'tool_use');

      if (toolUseBlock && toolUseBlock.name === 'check_product_availability') {
        console.log('Claude solicito check_product_availability con:', toolUseBlock.input);
        // Ejecutar la verificación de disponibilidad con datos de BD
        try {
          const { series, format } = toolUseBlock.input;
          const availabilityResult = await checkFormatAvailability(pool, { series, format });

          const followUpMessages = [
            ...messages,
            { role: 'assistant', content: response.content },
            {
              role: 'user',
              content: [
                {
                  type: 'tool_result',
                  tool_use_id: toolUseBlock.id,
                  content: JSON.stringify(availabilityResult),
                },
              ],
            },
          ];

          response = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            system: systemPrompt + sentimentSystemPrompt + catalogContext,
            messages: followUpMessages,
            tools: [PRICE_TOOL, CHECK_AVAILABILITY_TOOL],
          });
        } catch (error) {
          console.error('Error checking availability:', error);
          const errorResult = {
            available: false,
            error: 'Error verificando disponibilidad en la base de datos',
          };

          const followUpMessages = [
            ...messages,
            { role: 'assistant', content: response.content },
            {
              role: 'user',
              content: [
                {
                  type: 'tool_result',
                  tool_use_id: toolUseBlock.id,
                  content: JSON.stringify(errorResult),
                },
              ],
            },
          ];

          response = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            system: systemPrompt + sentimentSystemPrompt + catalogContext,
            messages: followUpMessages,
            tools: [PRICE_TOOL, CHECK_AVAILABILITY_TOOL],
          });
        }
      } else if (toolUseBlock && toolUseBlock.name === 'calculate_price') {
        console.log('Claude solicito calculate_price con:', toolUseBlock.input);
        const toolResult = calculatePrice(toolUseBlock.input);

        const followUpMessages = [
          ...messages,
          { role: 'assistant', content: response.content },
          {
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: toolUseBlock.id,
                content: JSON.stringify(toolResult),
              },
            ],
          },
        ];

        response = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: systemPrompt + sentimentSystemPrompt + catalogContext,
          messages: followUpMessages,
          tools: [PRICE_TOOL],
        });
      }
    }

    console.log('Respuesta de Claude recibida');

    const textBlock = response.content && response.content.find((block) => block.type === 'text');
    if (textBlock) {
      return textBlock.text;
    }

    return 'No pude generar una respuesta. Por favor, intenta de nuevo.';
  } catch (error) {
    console.error('Error in ceramicoAnswer:', error);
    throw error;
  }
}

module.exports = {
  ceramicoAnswer,
  isTransportIntent,
  buildCompactCatalog,
  buildSystemPrompt,
  buildSentimentSystemPrompt,
  analyzeSentiment,
};
