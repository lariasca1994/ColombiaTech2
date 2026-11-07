process.env.JWT_SECRET = 'secreto-de-prueba-solo-para-jest';

import { JwtService } from '@nestjs/jwt';
import { HttpException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { MfaService } from './mfa.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

// Los correos no salen: se captura el código enviado.
const enviados: string[] = [];
jest.mock('./correo', () => ({
  enviarCorreo: jest.fn(async (_a: string, _n: string, _s: string, texto: string) => {
    enviados.push(texto);
  }),
}));
const ultimoCodigo = () => (enviados[enviados.length - 1].match(/\b(\d{6})\b/) || [])[1];

function preparar() {
  const usuario: any = {
    _id: { toString: () => 'u1' },
    email: 'usuario@ejemplo.com',
    name: 'Ana',
    role: 'user',
    active: true,
    password: '',
    mfa: { totp: 'clave-anterior', preferido: 'totp' },
  };
  const users: any = {
    findByIdWithMfa: jest.fn(async () => usuario),
    findByIdWithPassword: jest.fn(async () => usuario),
    findByEmailWithPassword: jest.fn(async () => usuario),
    findOne: jest.fn(async () => usuario),
    setMfa: jest.fn(async (_id: string, mfa: any) => { usuario.mfa = mfa; }),
    setPassword: jest.fn(async (_id: string, p: string) => { usuario.password = await bcrypt.hash(p, 4); }),
  };
  const auditoria: any = { registrar: jest.fn(async () => undefined) };
  const mfa = new MfaService(users, auditoria);
  const jwt = new JwtService({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: '4h' } });
  const auth = new AuthService(users, jwt, mfa);
  return { usuario, users, mfa, jwt, auth };
}

const paseLogin = (jwt: JwtService) =>
  jwt.signAsync({ sub: 'u1', tipo: 'mfa' }, { secret: `${process.env.JWT_SECRET}.mfa`, expiresIn: '10m' });

describe('Olvidé mi contraseña', () => {
  beforeEach(() => { enviados.length = 0; });

  it('el enlace sirve una sola vez, cierra las sesiones y deja activa la verificación en dos pasos', async () => {
    const { usuario, auth, jwt, users } = preparar();
    usuario.password = await bcrypt.hash('Anterior#2026', 4);
    const sesionVieja = await jwt.signAsync({ sub: 'u1', email: usuario.email, iat: Math.floor(Date.now() / 1000) - 60 });

    await auth.recuperar('usuario@ejemplo.com');
    const token = (enviados[0].match(/restablecer#(\S+)/) || [])[1];
    expect(token).toBeTruthy();

    await auth.restablecer(token, 'Nueva#2026x');
    await expect(auth.restablecer(token, 'Otra#2026xx')).rejects.toThrow('El enlace no es válido');
    expect(usuario.mfa.totp).toBe('clave-anterior');
    expect(usuario.mfa.sesiones_desde).toBeGreaterThan(0);

    const estrategia = new JwtStrategy(users);
    await expect(estrategia.validate(jwt.decode(sesionVieja))).rejects.toBeInstanceOf(UnauthorizedException);
    const nueva = jwt.decode(await jwt.signAsync({ sub: 'u1', email: usuario.email }));
    await expect(estrategia.validate(nueva)).resolves.toMatchObject({ userId: 'u1' });
  });

  it('un correo no registrado recibe la misma respuesta y no envía nada', async () => {
    const { auth, users } = preparar();
    users.findByEmailWithPassword.mockResolvedValueOnce(null);
    await expect(auth.recuperar('nadie@ejemplo.com')).resolves.toBeUndefined();
    expect(enviados).toHaveLength(0);
  });
});

describe('Perdí mi autenticador', () => {
  beforeEach(() => { enviados.length = 0; });

  it('envía el código al correo aunque el método correo no esté activo y obliga a configurar la app nueva', async () => {
    const { usuario, auth, jwt } = preparar();
    const pase = await paseLogin(jwt);

    await auth.mfaRecuperarEnviar(pase);
    expect(enviados).toHaveLength(1);
    expect(usuario.mfa.recuperacion.expira - Date.now() / 1000).toBeGreaterThan(14 * 60);

    const r = await auth.mfaRecuperarVerificar(pase, ultimoCodigo());
    expect(r.qr).toContain('<svg');
    expect(usuario.mfa.totp).toBe('clave-anterior'); // sigue la anterior hasta activar la nueva

    // El pase del login no sirve para activar; el de reconfigurar no sirve para entrar sin la app.
    await expect(auth.mfaRecuperarActivar(pase, '000000')).rejects.toBeInstanceOf(UnauthorizedException);
    const codigo = MfaService.totp(r.secreto, Math.floor(Date.now() / 1000 / 30));
    const sesion = await auth.mfaRecuperarActivar(r.pase, codigo);
    expect(sesion.token).toBeTruthy();
    expect(usuario.mfa.totp).not.toBe('clave-anterior');
    expect(usuario.mfa.preferido).toBe('totp');
    expect(usuario.mfa.correo).toBeFalsy();
  });

  it('limita los envíos', async () => {
    const { auth, jwt } = preparar();
    const pase = await paseLogin(jwt);
    for (let i = 0; i < 3; i++) await auth.mfaRecuperarEnviar(pase);
    await expect(auth.mfaRecuperarEnviar(pase)).rejects.toBeInstanceOf(HttpException);
    expect(enviados).toHaveLength(3);
  });

  it('5 códigos errados bloquean la recuperación 15 minutos', async () => {
    const { usuario, auth, jwt } = preparar();
    const pase = await paseLogin(jwt);
    await auth.mfaRecuperarEnviar(pase);
    const bueno = ultimoCodigo();
    const malo = bueno === '000000' ? '111111' : '000000';
    for (let i = 0; i < 4; i++) {
      await expect(auth.mfaRecuperarVerificar(pase, malo)).rejects.toBeInstanceOf(UnauthorizedException);
    }
    await expect(auth.mfaRecuperarVerificar(pase, malo)).rejects.toMatchObject({ status: 429 });
    await expect(auth.mfaRecuperarVerificar(pase, bueno)).rejects.toMatchObject({ status: 429 });
    await expect(auth.mfaRecuperarEnviar(pase)).rejects.toMatchObject({ status: 429 });
    const restante = usuario.mfa.bloqueo_recuperacion_hasta - Date.now() / 1000;
    expect(restante).toBeGreaterThan(14 * 60);
    expect(restante).toBeLessThanOrEqual(15 * 60);
  });

  it('el código vence a los 15 minutos', async () => {
    const { usuario, auth, jwt } = preparar();
    const pase = await paseLogin(jwt);
    await auth.mfaRecuperarEnviar(pase);
    usuario.mfa.recuperacion.expira = Date.now() / 1000 - 1;
    await expect(auth.mfaRecuperarVerificar(pase, ultimoCodigo())).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
