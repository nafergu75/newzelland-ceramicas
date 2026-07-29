const config = require('../config');
const { buscarRelevantes } = require('../rag/retriever');
const { marcarHandoff } = require('../conversation/store');

// Las herramientas de escritura (presupuesto) llaman a la MISMA API pública
// que ya usa la web (POST /api/quote-requests), en vez de escribir en
// quote_requests directamente: así el bot dispara automáticamente el hook
// de CRM (tag lead_presupuesto + email de confirmación) que ya existe y
// está probado en api/index.js — sin duplicar esa lógica aquí.
const API_BASE = config.frontendUrl.replace(/\/$/, '');

const TOOL_DEFINITIONS = [
  {
    name: 'buscar_catalogo',
    description: 'Busca series de cerámica/porcelánico relevantes para una pregunta del cliente (colores, materiales, uso, ambiente). Devuelve las series más afines por similitud semántica.',
    input_schema: {
      type: 'object',
      properties: {
        pregunta: { type: 'string', description: 'La necesidad o pregunta del cliente en lenguaje natural, ej. "azulejo azul para baño antideslizante"' },
      },
      required: ['pregunta'],
    },
  },
  {
    name: 'buscar_proyectos',
    description: 'Busca proyectos/casos de éxito reales ya ejecutados que encajen con la pregunta (tipo de espacio, colección usada, ubicación).',
    input_schema: {
      type: 'object',
      properties: {
        pregunta: { type: 'string', description: 'Qué tipo de proyecto busca el cliente, ej. "reforma de cocina con Alpina"' },
      },
      required: ['pregunta'],
    },
  },
  {
    name: 'crear_solicitud_presupuesto',
    description: 'Crea una solicitud de presupuesto formal cuando el cliente tiene un interés concreto y ha dado los datos necesarios.',
    input_schema: {
      type: 'object',
      properties: {
        nombre_completo: { type: 'string' },
        email: { type: 'string' },
        telefono: { type: 'string' },
        tipo_proyecto: { type: 'string', description: 'ej. reforma, obra nueva, proyecto comercial' },
        tipo_espacio: { type: 'string', description: 'ej. baño, cocina, salón, fachada' },
        descripcion: { type: 'string', description: 'Resumen del proyecto: m², qué busca, series de interés si las hay' },
      },
      required: ['nombre_completo', 'email', 'telefono', 'descripcion'],
    },
  },
  {
    name: 'derivar_a_humano',
    description: 'Marca la conversación para que la atienda una persona del equipo y detiene las respuestas automáticas. Úsalo cuando no puedas ayudar, el cliente lo pida explícitamente, o el caso sea una incidencia/reclamación.',
    input_schema: {
      type: 'object',
      properties: {
        motivo: { type: 'string', description: 'Motivo breve del handoff, para que el equipo tenga contexto' },
      },
      required: ['motivo'],
    },
  },
];

async function formatearResultadosRAG(resultados, tipoLabel) {
  if (resultados.length === 0) return `No se encontraron ${tipoLabel} relevantes.`;
  return resultados
    .map((r, i) => `${i + 1}. [score ${r.score.toFixed(2)}] ${r.texto}`)
    .join('\n');
}

async function ejecutarHerramienta(nombre, input, { conversationId }) {
  switch (nombre) {
    case 'buscar_catalogo': {
      const resultados = await buscarRelevantes(input.pregunta, 5, { tipo: 'serie' });
      return formatearResultadosRAG(resultados, 'series de catálogo');
    }

    case 'buscar_proyectos': {
      const resultados = await buscarRelevantes(input.pregunta, 5, { tipo: 'proyecto' });
      return formatearResultadosRAG(resultados, 'proyectos');
    }

    case 'crear_solicitud_presupuesto': {
      try {
        const response = await fetch(`${API_BASE}/api/quote-requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre_completo: input.nombre_completo,
            email: input.email,
            telefono: input.telefono,
            tipo_proyecto: input.tipo_proyecto || null,
            tipo_espacio: input.tipo_espacio || null,
            descripcion: input.descripcion,
            utm_source: 'whatsapp',
            utm_medium: 'bot',
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          return `Error al crear la solicitud: ${data.message || 'error desconocido'}. Informa al cliente y ofrece derivar a humano.`;
        }
        return 'Solicitud de presupuesto creada correctamente. El equipo comercial la revisará y contactará en 24-48h. Informa al cliente de esto de forma natural.';
      } catch (error) {
        return `Error de conexión al crear la solicitud (${error.message}). Discúlpate con el cliente y ofrece derivar a humano.`;
      }
    }

    case 'derivar_a_humano': {
      await marcarHandoff(conversationId, input.motivo);
      return 'Conversación marcada para atención humana. Despídete brevemente indicando que alguien del equipo continuará la conversación.';
    }

    default:
      return `Herramienta desconocida: ${nombre}`;
  }
}

module.exports = { TOOL_DEFINITIONS, ejecutarHerramienta };
