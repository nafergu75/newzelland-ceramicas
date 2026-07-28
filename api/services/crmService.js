// ============================================
// CRM SERVICE (facade independiente de proveedor)
//
// Capa única que llama el resto del backend (hooks en registro, descargas,
// formularios, aprobación de partners). Nunca se llama directamente a
// brevoProvider desde api/index.js — así cambiar de Brevo a Mailchimp/HubSpot
// en el futuro es añadir un provider nuevo en crmProviders/ y registrarlo
// abajo, sin tocar ningún hook.
//
// Todas las funciones son "fire-and-forget seguro": si CRM_ENABLED=false o
// la llamada al proveedor falla, se loguea y se devuelve sin lanzar — un
// fallo de Brevo NUNCA debe romper el registro, la descarga o el envío de
// un formulario (esas operaciones ya se completaron en la BD antes de
// llegar aquí).
// ============================================

const CRM_ENABLED = process.env.CRM_ENABLED === 'true';
const CRM_PROVIDER = (process.env.CRM_PROVIDER || 'brevo').toLowerCase();

const providers = {
  brevo: require('./crmProviders/brevoProvider'),
  // mailchimp: require('./crmProviders/mailchimpProvider'),
  // hubspot: require('./crmProviders/hubspotProvider'),
};

function getProvider() {
  const provider = providers[CRM_PROVIDER];
  if (!provider) {
    throw new Error(`CRM_PROVIDER desconocido: "${CRM_PROVIDER}". Proveedores disponibles: ${Object.keys(providers).join(', ')}`);
  }
  return provider;
}

/**
 * Crea o actualiza un contacto en el CRM y le asigna tags/atributos.
 * @param {object} params
 * @param {string} params.email
 * @param {string} [params.nombre]
 * @param {string} [params.telefono]
 * @param {string} [params.pais]
 * @param {'particular'|'profesional'} [params.tipoCliente]
 * @param {string[]} [params.tags] - ej. ['registro_web', 'profesional']
 * @param {object} [params.extraAttributes] - campos adicionales ya en formato CRM (mayúsculas)
 */
async function createOrUpdateContact({ email, nombre, telefono, pais, tipoCliente, tags = [], extraAttributes = {} }) {
  if (!CRM_ENABLED) return;
  if (!email) return;

  try {
    const attributes = {
      ...(nombre ? { NOMBRE: nombre } : {}),
      ...(telefono ? { TELEFONO: telefono } : {}),
      ...(pais ? { PAIS: pais } : {}),
      ...(tipoCliente ? { TIPO_CLIENTE: tipoCliente } : {}),
      ...extraAttributes,
    };

    await getProvider().upsertContact({
      email,
      attributes,
      tags,
      listId: process.env.CRM_LIST_ID,
    });

    console.log(`[CRM] Contacto sincronizado (${CRM_PROVIDER}): ${email} — tags: ${tags.join(', ') || '(ninguna)'}`);
  } catch (error) {
    console.error(`[CRM] Error sincronizando contacto ${email}:`, error.message);
  }
}

/**
 * Atajo para asignar una sola tag adicional sin tocar el resto de atributos
 * (ej. al aprobar un partner). Internamente reutiliza createOrUpdateContact.
 */
async function addTag(email, tag) {
  return createOrUpdateContact({ email, tags: [tag] });
}

/**
 * Envía un email transaccional ya renderizado (subject + HTML) — las
 * plantillas viven en emailTemplates.js, no aquí.
 */
async function sendTransactionalEmail({ to, toName, subject, html }) {
  if (!CRM_ENABLED) return;
  if (!to) return;

  try {
    await getProvider().sendTransactionalEmail({ to, toName, subject, html });
    console.log(`[CRM] Email transaccional enviado a ${to}: "${subject}"`);
  } catch (error) {
    console.error(`[CRM] Error enviando email a ${to}:`, error.message);
  }
}

module.exports = {
  createOrUpdateContact,
  addTag,
  sendTransactionalEmail,
  isEnabled: () => CRM_ENABLED,
};
