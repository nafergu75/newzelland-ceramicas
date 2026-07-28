// ============================================
// PROVEEDOR CRM: Brevo (antes Sendinblue)
// Implementa la interfaz de bajo nivel que espera crmService.js:
//   upsertContact({ email, attributes, tags }) -> void
//   sendTransactionalEmail({ to, toName, subject, html }) -> void
//
// Documentación API: https://developers.brevo.com/reference
// Todas las llamadas usan `fetch` global (Node 24 en Vercel), sin
// dependencias nuevas — coherente con el resto de api/index.js, que ya
// usa fetch para descargar los PDFs de catálogo.
// ============================================

const BREVO_BASE_URL = process.env.CRM_BASE_URL || 'https://api.brevo.com/v3';

function assertConfigured() {
  if (!process.env.CRM_API_KEY) {
    throw new Error('CRM_API_KEY no configurada');
  }
}

async function brevoFetch(pathname, options = {}) {
  assertConfigured();
  const response = await fetch(`${BREVO_BASE_URL}${pathname}`, {
    ...options,
    headers: {
      'api-key': process.env.CRM_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
      ...(options.headers || {}),
    },
  });

  // Brevo devuelve 204 sin cuerpo en varias mutaciones (ej. update de contacto)
  if (response.status === 204) return null;

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = body?.message || `Brevo respondió ${response.status}`;
    throw new Error(message);
  }
  return body;
}

// Brevo modela las "tags" del enunciado como un atributo de texto propio
// (TAGS, coma-separado) en vez de un array nativo: la API v3 de contactos
// no tiene un endpoint de tags libres tipo Mailchimp: la segmentación real
// de Brevo son las listas. Este atributo de texto es el sustituto simple
// y queda documentado en README-CRM.md qué atributo crear en el dashboard.
async function fetchExistingTags(email) {
  try {
    const contact = await brevoFetch(`/contacts/${encodeURIComponent(email)}`);
    const raw = contact?.attributes?.TAGS;
    return raw ? String(raw).split(',').map((t) => t.trim()).filter(Boolean) : [];
  } catch (error) {
    // Contacto inexistente (404) u otro error de lectura: se trata como
    // "sin tags previas" — el POST de creación de más abajo lo resuelve.
    return [];
  }
}

/**
 * Crea o actualiza un contacto en Brevo (upsert real vía updateEnabled).
 * Acumula tags nuevas con las existentes (no las pisa).
 */
async function upsertContact({ email, attributes = {}, tags = [], listId }) {
  const tagsExistentes = tags.length ? await fetchExistingTags(email) : [];
  const tagsFinal = Array.from(new Set([...tagsExistentes, ...tags]));

  const payload = {
    email,
    attributes: {
      ...attributes,
      ...(tagsFinal.length ? { TAGS: tagsFinal.join(',') } : {}),
    },
    updateEnabled: true,
    ...(listId ? { listIds: [parseInt(listId, 10)] } : {}),
  };

  await brevoFetch('/contacts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Envío transaccional directo (subject + HTML), sin depender de plantillas
 * pre-creadas en el dashboard de Brevo — reduce la fricción de puesta en
 * marcha. El pie de página de cada email incluye el tag `{unsubscribe}`,
 * que Brevo sustituye automáticamente por el enlace de baja SOLO si la
 * cuenta tiene activada la opción "Unsubscribe link" en Transactional >
 * Settings (ver README-CRM.md).
 */
async function sendTransactionalEmail({ to, toName, subject, html }) {
  await brevoFetch('/smtp/email', {
    method: 'POST',
    body: JSON.stringify({
      sender: {
        email: process.env.CRM_SENDER_EMAIL || 'info@newzelland.es',
        name: process.env.CRM_SENDER_NAME || 'Newzeland Cerámicas',
      },
      to: [{ email: to, name: toName || undefined }],
      subject,
      htmlContent: html,
    }),
  });
}

module.exports = { upsertContact, sendTransactionalEmail };
