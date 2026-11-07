process.env.JWT_SECRET = 'secreto-de-prueba-solo-para-jest';

import { correoRemitente, documento, enviarCorreo, nombreRemitente, NOMBRE_PORTAL } from './correo';
import { MfaService } from './mfa.service';

describe('nombre descriptivo del portal en correos y QR', () => {
  const original = { ...process.env };
  afterEach(() => {
    process.env = { ...original };
    jest.restoreAllMocks();
  });

  it('el remitente usa el nombre del portal si la variable viene vacía o con el nombre anterior', () => {
    delete process.env.BREVO_REMITENTE_NOMBRE;
    expect(nombreRemitente()).toBe('Alquiler de vivienda');
    process.env.BREVO_REMITENTE_NOMBRE = 'ColombiaTech';
    expect(nombreRemitente()).toBe(NOMBRE_PORTAL);
    process.env.BREVO_REMITENTE_NOMBRE = 'Colombia Tech 2';
    expect(nombreRemitente()).toBe(NOMBRE_PORTAL);
    process.env.BREVO_REMITENTE_NOMBRE = 'Otro nombre';
    expect(nombreRemitente()).toBe('Otro nombre');
  });

  it('acepta el correo del remitente solo o con nombre', () => {
    process.env.BREVO_REMITENTE = 'avisos@ejemplo.com';
    expect(correoRemitente()).toBe('avisos@ejemplo.com');
    process.env.BREVO_REMITENTE = 'ColombiaTech <avisos@ejemplo.com>';
    expect(correoRemitente()).toBe('avisos@ejemplo.com');
  });

  it('encabezado y pie del correo muestran el nombre del portal', () => {
    const html = documento('Asunto', '<p>Hola</p>');
    expect(html).toContain('>Alquiler de vivienda</span>');
    expect(html).toContain('Correo automático de Alquiler de vivienda.');
    expect(html).not.toMatch(/colombia\s*tech/i);
  });

  it('Brevo recibe el nombre del portal como remitente', async () => {
    process.env.BREVO_API_KEY = 'clave-de-prueba';
    process.env.BREVO_REMITENTE = 'avisos@ejemplo.com';
    process.env.BREVO_REMITENTE_NOMBRE = 'ColombiaTech';
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, status: 201 } as Response);
    await enviarCorreo('usuario@ejemplo.com', 'Ana', 'Tu código de acceso · Alquiler de vivienda', 'texto', '<p>x</p>');
    const cuerpo = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(cuerpo.sender).toEqual({ email: 'avisos@ejemplo.com', name: 'Alquiler de vivienda' });
    expect(cuerpo.subject).toContain('Alquiler de vivienda');
  });

  it('el QR de la app autenticadora usa el nombre del portal como emisor', async () => {
    const usuario: any = { _id: { toString: () => 'u1' }, email: 'usuario@ejemplo.com', name: 'Ana', mfa: {} };
    const users: any = { setMfa: jest.fn(async (_id: string, mfa: any) => { usuario.mfa = mfa; }) };
    const mfa = new MfaService(users, { registrar: jest.fn() } as any);
    const espia = jest.spyOn(require('qrcode'), 'toString');
    await mfa.iniciarTotp(usuario);
    const uri = espia.mock.calls[0][0] as string;
    expect(uri).toContain('otpauth://totp/Alquiler%20de%20vivienda:');
    expect(uri).toContain('issuer=Alquiler%20de%20vivienda');
  });
});
