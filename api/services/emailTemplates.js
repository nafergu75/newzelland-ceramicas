// ============================================
// PLANTILLAS DE EMAIL (E3 — automatizaciones básicas)
// Cada función devuelve { subject, html } listo para pasar a
// crmService.sendTransactionalEmail(). HTML simple e inline (sin CSS
// externo) para máxima compatibilidad con clientes de correo.
//
// El pie común incluye el tag {unsubscribe}, que Brevo reemplaza por el
// enlace de baja real si la cuenta tiene esa opción activada (ver
// README-CRM.md) — no se implementa un unsubscribe propio para no
// duplicar lo que el CRM ya resuelve.
// ============================================

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const MARCA = 'Newzeland Cerámicas';

function primerNombre(nombreCompleto) {
  return (nombreCompleto || '').trim().split(/\s+/)[0] || '';
}

function layout(cuerpoHtml) {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <div style="padding: 24px 0; border-bottom: 2px solid #1a1a1a; margin-bottom: 24px;">
        <strong style="font-size: 18px;">${MARCA}</strong>
      </div>
      ${cuerpoHtml}
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #999;">
        <p>${MARCA} — Onda, Castellón.</p>
        <p><a href="{unsubscribe}" style="color: #999;">Darte de baja de estas comunicaciones</a></p>
      </div>
    </div>
  `;
}

function boton(href, texto) {
  return `<a href="${href}" style="display:inline-block; padding:12px 24px; background-color:#1a1a1a; color:#ffffff; text-decoration:none; border-radius:4px; font-weight:600;">${texto}</a>`;
}

/** a) Bienvenida — disparador: alta en `users` */
function bienvenida(nombreCompleto) {
  const nombre = primerNombre(nombreCompleto);
  return {
    subject: `Bienvenido/a a ${MARCA} – Ya puedes descargar tus catálogos`,
    html: layout(`
      <p>Hola ${nombre || ''},</p>
      <p>Gracias por registrarte en ${MARCA}. Tu cuenta ya está activa y tienes acceso a nuestros catálogos técnicos y de colección.</p>
      <p style="margin: 28px 0;">
        ${boton(`${FRONTEND_URL}/downloads`, 'Ir a mis descargas')}
      </p>
      <p>También puedes explorar nuestras <a href="${FRONTEND_URL}/collections">colecciones</a>, y si tienes un proyecto entre manos, estaremos encantados de <a href="${FRONTEND_URL}/contact">ayudarte</a> o prepararte un <a href="${FRONTEND_URL}/presupuesto">presupuesto</a>.</p>
      <p>Un saludo,<br/>Equipo ${MARCA}</p>
    `),
  };
}

/** b) Post-descarga — disparador: primera descarga en `catalog_downloads` */
function postDescarga(nombreCompleto) {
  const nombre = primerNombre(nombreCompleto);
  return {
    subject: 'Gracias por descargar nuestro catálogo – ¿En qué podemos ayudarte?',
    html: layout(`
      <p>Hola ${nombre || ''},</p>
      <p>Gracias por descargar nuestro catálogo. Esperamos que te sirva de inspiración para tu próximo proyecto.</p>
      <p>Si ya tienes algo en mente, podemos ayudarte a darle forma:</p>
      <p style="margin: 28px 0;">
        ${boton(`${FRONTEND_URL}/presupuesto`, 'Solicitar presupuesto')}
      </p>
      <p>O si prefieres resolver dudas antes, <a href="${FRONTEND_URL}/contact">contáctanos</a> directamente.</p>
      <p>Un saludo,<br/>Equipo ${MARCA}</p>
    `),
  };
}

/** c) Confirmación de presupuesto — disparador: alta en `quote_requests` */
function presupuestoRecibido(nombreCompleto) {
  const nombre = primerNombre(nombreCompleto);
  return {
    subject: `Hemos recibido tu solicitud de presupuesto – ${MARCA}`,
    html: layout(`
      <p>Hola ${nombre || ''},</p>
      <p>Hemos recibido tu solicitud de presupuesto. Nuestro equipo revisará los detalles de tu proyecto y te contactaremos en un plazo de 24–48 horas laborables con una propuesta.</p>
      <p>Mientras tanto, puedes echar un vistazo a algunos de nuestros <a href="${FRONTEND_URL}/proyectos">casos de éxito</a>.</p>
      <p>Si necesitas contactarnos antes, escríbenos a info@newzelland.es.</p>
      <p>Un saludo,<br/>Equipo ${MARCA}</p>
    `),
  };
}

/** d) Partner aprobado — disparador: cambio de estado en `partners` a "aprobado" */
function partnerAprobado(nombreCompleto) {
  const nombre = primerNombre(nombreCompleto);
  return {
    subject: `Tu registro como partner ha sido aprobado – ${MARCA}`,
    html: layout(`
      <p>Hola ${nombre || ''},</p>
      <p>¡Buenas noticias! Tu registro como profesional en ${MARCA} ha sido aprobado.</p>
      <p>A partir de ahora tienes acceso a condiciones especiales para profesionales, catálogos técnicos y soporte comercial directo.</p>
      <p style="margin: 28px 0;">
        ${boton(`${FRONTEND_URL}/contact`, 'Contactar con el equipo comercial')}
      </p>
      <p>Un saludo,<br/>Equipo ${MARCA}</p>
    `),
  };
}

module.exports = {
  bienvenida,
  postDescarga,
  presupuestoRecibido,
  partnerAprobado,
};
