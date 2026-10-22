import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import * as QRCode from 'qrcode';
import { UsersService } from '../users/users.service';
import { enviarCorreo } from './correo';

// Verificación en dos pasos (obligatoria). Cada cuenta usa al menos uno de dos métodos:
// - App autenticadora (TOTP, RFC 6238): la clave se guarda cifrada con AES-256-GCM (llave
//   derivada de JWT_SECRET con HKDF); un código no se acepta dos veces y 5 errados la bloquean 15 min.
// - Código por correo: 6 dígitos que vencen en 10 min; solo se guarda su huella (HMAC), admite
//   5 intentos y se pueden pedir 3 cada 10 minutos.
export type Metodo = 'totp' | 'correo';
export const METODOS: Record<Metodo, string> = { totp: 'App autenticadora', correo: 'Código por correo' };

const EMISOR = 'ColombiaTech';
const PASO = 30;
const CODIGO_MIN = 10;
const MAX_INTENTOS = 5;
const MAX_ENVIOS = 3;
const BLOQUEO_SEG = 15 * 60;
const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

type Usuario = { _id: any; email: string; name: string; mfa?: Record<string, any> };

@Injectable()
export class MfaService {
  private readonly clave = Buffer.from(
    hkdfSync('sha256', process.env.JWT_SECRET as string, Buffer.alloc(0), 'ColombiaTech.MFA.v1', 32),
  );

  constructor(private readonly usersService: UsersService) {}

  // ─── utilidades ───
  private cifrar(texto: string): string {
    const nonce = randomBytes(12);
    const c = createCipheriv('aes-256-gcm', this.clave, nonce);
    const datos = Buffer.concat([c.update(texto, 'utf8'), c.final()]);
    return Buffer.concat([nonce, datos, c.getAuthTag()]).toString('base64');
  }

  private descifrar(valor: string): string {
    const b = Buffer.from(valor, 'base64');
    const d = createDecipheriv('aes-256-gcm', this.clave, b.subarray(0, 12));
    d.setAuthTag(b.subarray(b.length - 16));
    return Buffer.concat([d.update(b.subarray(12, b.length - 16)), d.final()]).toString('utf8');
  }

  private huella(codigo: string): string {
    return createHmac('sha256', this.clave).update(codigo).digest('hex');
  }

  private static iguales(a: string, b: string): boolean {
    const x = Buffer.from(a);
    const y = Buffer.from(b);
    return x.length === y.length && timingSafeEqual(x, y);
  }

  static totp(secreto: string, paso: number): string {
    let bits = '';
    for (const c of secreto.replace(/=+$/, '')) bits += ALFABETO.indexOf(c).toString(2).padStart(5, '0');
    const clave = Buffer.from((bits.match(/.{8}/g) || []).map((b) => parseInt(b, 2)));
    const contador = Buffer.alloc(8);
    contador.writeBigUInt64BE(BigInt(paso));
    const h = createHmac('sha1', clave).update(contador).digest();
    const o = h[h.length - 1] & 15;
    return String((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).padStart(6, '0');
  }

  private static limpiar(codigo: string): string {
    return (codigo || '').replace(/\D/g, '');
  }

  estado(u: Usuario): Record<string, any> {
    return { ...(u.mfa || {}) };
  }

  activos(u: Usuario): Metodo[] {
    const m = this.estado(u);
    return (['totp', 'correo'] as Metodo[]).filter((x) => (x === 'totp' ? !!m.totp : !!m.correo));
  }

  configurado(u: Usuario): boolean {
    return this.activos(u).length > 0;
  }

  preferido(u: Usuario): Metodo | null {
    const activos = this.activos(u);
    const elegido = this.estado(u).preferido;
    return activos.includes(elegido) ? elegido : activos[0] || null;
  }

  async cargar(id: string): Promise<Usuario | null> {
    return (await this.usersService.findByIdWithMfa(id)) as any;
  }

  private async guardar(u: Usuario, cambios: Record<string, any>): Promise<void> {
    u.mfa = { ...this.estado(u), ...cambios };
    await this.usersService.setMfa(u._id.toString(), u.mfa);
  }

  // ─── app autenticadora ───
  async iniciarTotp(u: Usuario): Promise<{ qr: string; secreto: string }> {
    const bytes = randomBytes(20);
    let bits = '';
    for (const b of bytes) bits += b.toString(2).padStart(8, '0');
    const secreto = (bits.match(/.{1,5}/g) || []).map((g) => ALFABETO[parseInt(g.padEnd(5, '0'), 2)]).join('');
    await this.guardar(u, { totp_pendiente: this.cifrar(secreto) });
    const uri = `otpauth://totp/${encodeURIComponent(EMISOR)}:${encodeURIComponent(u.email)}` +
      `?secret=${secreto}&issuer=${encodeURIComponent(EMISOR)}&digits=6&period=${PASO}`;
    const qr = await QRCode.toString(uri, { type: 'svg', errorCorrectionLevel: 'M', margin: 1 });
    return { qr, secreto };
  }

  private async verificarTotp(u: Usuario, cifrado: string | undefined, codigo: string): Promise<boolean> {
    if (!cifrado || codigo.length !== 6) return false;
    const secreto = this.descifrar(cifrado);
    const actual = Math.floor(Date.now() / 1000 / PASO);
    const ultimo = this.estado(u).ultimo_paso || 0;
    for (const paso of [actual - 1, actual, actual + 1]) {
      if (paso > ultimo && MfaService.iguales(MfaService.totp(secreto, paso), codigo)) {
        await this.guardar(u, { ultimo_paso: paso });
        return true;
      }
    }
    return false;
  }

  async activarTotp(u: Usuario, codigo: string): Promise<boolean> {
    const pendiente = this.estado(u).totp_pendiente;
    if (!(await this.verificarTotp(u, pendiente, MfaService.limpiar(codigo)))) return false;
    const cambios: Record<string, any> = { totp: pendiente, totp_pendiente: null };
    if (!this.configurado(u)) cambios.preferido = 'totp';
    await this.guardar(u, cambios);
    return true;
  }

  // ─── código por correo ───
  async enviarCodigo(u: Usuario): Promise<boolean> {
    const ahora = Date.now() / 1000;
    const envios = (this.estado(u).envios || []).filter((t: number) => ahora - t < CODIGO_MIN * 60);
    if (envios.length >= MAX_ENVIOS) return false;
    const codigo = String(randomInt(0, 1_000_000)).padStart(6, '0');
    await this.guardar(u, {
      codigo: { huella: this.huella(codigo), expira: ahora + CODIGO_MIN * 60, intentos: 0 },
      envios: [...envios, ahora],
    });
    const nombre = u.name || '';
    await enviarCorreo(
      u.email, nombre, `Tu código de acceso · ${EMISOR}`,
      `Hola ${nombre},\n\nTu código de verificación de ${EMISOR} es: ${codigo}\n\n` +
        `Vence en ${CODIGO_MIN} minutos y sirve una sola vez. Si no intentaste ingresar, cambia tu contraseña.`,
      `<p>Hola ${nombre.replace(/[<>&"']/g, '')},</p><p>Tu código de verificación de <strong>${EMISOR}</strong> es:</p>` +
        `<p style="font-size:28px;font-weight:700;letter-spacing:6px">${codigo}</p>` +
        `<p>Vence en ${CODIGO_MIN} minutos y sirve una sola vez. Si no intentaste ingresar, cambia tu contraseña.</p>`,
    );
    return true;
  }

  private async verificarCorreo(u: Usuario, codigo: string): Promise<boolean> {
    const g = this.estado(u).codigo;
    if (!g || (g.intentos || 0) >= MAX_INTENTOS || g.expira < Date.now() / 1000) return false;
    if (!MfaService.iguales(g.huella, this.huella(codigo))) {
      await this.guardar(u, { codigo: { ...g, intentos: (g.intentos || 0) + 1 } });
      return false;
    }
    await this.guardar(u, { codigo: null });
    return true;
  }

  async activarCorreo(u: Usuario, codigo: string): Promise<boolean> {
    if (!(await this.verificarCorreo(u, MfaService.limpiar(codigo)))) return false;
    const cambios: Record<string, any> = { correo: true };
    if (!this.configurado(u)) cambios.preferido = 'correo';
    await this.guardar(u, cambios);
    return true;
  }

  // ─── verificación ───
  async verificar(u: Usuario, metodo: Metodo, codigo: string): Promise<boolean> {
    const limpio = MfaService.limpiar(codigo);
    if (!this.activos(u).includes(metodo)) return false;
    if (metodo === 'correo') return this.verificarCorreo(u, limpio);
    // Sin este freno, con la contraseña bastaría probar códigos hasta acertar.
    const e = this.estado(u);
    if ((e.bloqueo_hasta || 0) > Date.now() / 1000) return false;
    if (await this.verificarTotp(u, e.totp, limpio)) {
      if (e.fallos) await this.guardar(u, { fallos: 0 });
      return true;
    }
    const fallos = (e.fallos || 0) + 1;
    await this.guardar(u, fallos >= MAX_INTENTOS ? { fallos: 0, bloqueo_hasta: Date.now() / 1000 + BLOQUEO_SEG } : { fallos });
    return false;
  }

  async elegirPreferido(u: Usuario, metodo: Metodo): Promise<boolean> {
    if (!this.activos(u).includes(metodo)) return false;
    await this.guardar(u, { preferido: metodo });
    return true;
  }
}
