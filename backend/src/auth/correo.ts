import { Logger } from '@nestjs/common';

// Envío de correos con la API de Brevo (solo texto + HTML, sin adjuntos).
// Sin BREVO_API_KEY (desarrollo) no envía nada: escribe el aviso en el log.
const logger = new Logger('Correo');

export async function enviarCorreo(
  destino: string,
  nombre: string,
  asunto: string,
  texto: string,
  html: string,
): Promise<boolean> {
  const clave = (process.env.BREVO_API_KEY || '').trim();
  const remitente = (process.env.BREVO_REMITENTE || '').trim();
  if (!clave || !remitente) {
    logger.log(`[correo local] Para ${destino} | ${asunto}\n${texto}`);
    return false;
  }
  try {
    const respuesta = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': clave, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { email: remitente, name: 'ColombiaTech' },
        to: [{ email: destino, name: nombre }],
        subject: asunto,
        textContent: texto,
        htmlContent: html,
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
