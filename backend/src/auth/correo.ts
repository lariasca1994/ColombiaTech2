import { Logger } from '@nestjs/common';

// Envío de correos con la API de Brevo (solo texto + HTML, sin adjuntos).
// Sin BREVO_API_KEY (desarrollo) no envía nada: escribe el aviso en el log.
const logger = new Logger('Correo');

// Nombre descriptivo con el que el público ve el portal: asunto, encabezado, pie, remitente
// y emisor del QR de la app autenticadora. Servicios, URLs y variables conservan su nombre.
export const NOMBRE_PORTAL = 'Alquiler de vivienda';
const NOMBRE_ANTERIOR = /colombia\s*tech/i;

/** Nombre del remitente: BREVO_REMITENTE_NOMBRE, o el del portal si viene vacía o con el nombre anterior. */
export function nombreRemitente(): string {
  const valor = (process.env.BREVO_REMITENTE_NOMBRE || '').trim();
  return !valor || NOMBRE_ANTERIOR.test(valor) ? NOMBRE_PORTAL : valor;
}

/** Correo del remitente; admite BREVO_REMITENTE como "correo" o "Nombre <correo>". */
export function correoRemitente(): string {
  const valor = (process.env.BREVO_REMITENTE || '').trim();
  const m = valor.match(/<([^>]+)>/);
  return (m ? m[1] : valor).trim();
}

// Colores del sitio (Tailwind: barra gray-800, acento emerald-600, fondo
// emerald-50 de la portada): el correo se ve como la aplicación.
const C = {
  fondo: '#F7FDFA',
  superficie: '#FFFFFF',
  borde: '#E5E7EB',
  texto: '#111827',
  suave: '#4B5563',
  acento: '#059669',
  cabecera: '#1F2937',
  cabeceraTexto: '#FFFFFF',
};
const FUENTE = "Inter,system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif";

const escaparHtml = (texto: string) =>
  texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

/** Envuelve el contenido del correo con la cabecera, el logo y los colores del sitio. */
export function documento(asunto: string, contenido: string): string {
  const sitio = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  return (
    '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    `<title>${escaparHtml(asunto)}</title></head>` +
    `<body style="margin:0;padding:0;background:${C.fondo};">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.fondo};padding:24px 12px;"><tr><td align="center">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.superficie};` +
    `border:1px solid ${C.borde};border-radius:12px;overflow:hidden;font-family:${FUENTE};color:${C.texto};">` +
    `<tr><td style="background:${C.cabecera};border-top:4px solid ${C.acento};padding:16px 28px;">` +
    `<img src="${sitio}/apple-touch-icon.png" width="28" height="28" alt="" ` +
    'style="vertical-align:middle;border:0;border-radius:6px;margin-right:10px;">' +
    `<span style="vertical-align:middle;font-size:17px;font-weight:700;color:${C.cabeceraTexto};">${NOMBRE_PORTAL}</span></td></tr>` +
    `<tr><td style="padding:24px 28px 12px;font-size:15px;line-height:1.6;color:${C.texto};">${contenido}</td></tr>` +
    `<tr><td style="padding:16px 28px 22px;border-top:1px solid ${C.borde};font-size:12px;line-height:1.5;color:${C.suave};">` +
    `Correo automático de ${NOMBRE_PORTAL}. Si no esperabas este mensaje, puedes ignorarlo.</td></tr>` +
    '</table></td></tr></table></body></html>'
  );
}

export async function enviarCorreo(
  destino: string,
  nombre: string,
  asunto: string,
  texto: string,
  html: string,
): Promise<boolean> {
  const clave = (process.env.BREVO_API_KEY || '').trim();
  const remitente = correoRemitente();
  if (!clave || !remitente) {
    logger.log(`[correo local] Para ${destino} | ${asunto}\n${texto}`);
    return false;
  }
  try {
    const respuesta = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': clave, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { email: remitente, name: nombreRemitente() },
        to: [{ email: destino, name: nombre }],
        subject: asunto,
        textContent: texto,
        htmlContent: documento(asunto, html),
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!respuesta.ok) logger.error(`Brevo respondió ${respuesta.status}`);
    return respuesta.ok;
  } catch (error) {
    // El usuario recibe la misma respuesta genérica igual.
    logger.error(`Brevo no aceptó el correo: ${(error as Error).message}`);
    return false;
  }
}
