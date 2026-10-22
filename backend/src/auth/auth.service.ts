import { BadRequestException, ConflictException, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash, timingSafeEqual } from 'node:crypto';
import { UsersService } from '../users/users.service';
import { enviarCorreo } from './correo';
import { Metodo, MfaService } from './mfa.service';

// Pase de 10 minutos entre la contraseña y el código de la verificación en dos pasos.
// Se firma con un secreto derivado: la estrategia de sesión nunca lo acepta.
const secretoPase = () => `${process.env.JWT_SECRET}.mfa`;

const RECUPERAR_MINUTOS = 30;
const ENLACE_INVALIDO = 'El enlace no es válido o ya venció. Pide uno nuevo.';
// Máximo 3 enlaces cada 15 minutos por correo (en memoria; no bloquea el ingreso).
const envios = new Map<string, number[]>();

// El enlace de recuperación se firma con un secreto derivado: así la
// estrategia de sesión (que usa JWT_SECRET tal cual) nunca lo acepta.
const secretoRecuperar = () => `${process.env.JWT_SECRET}.recuperar`;

// Huella de la contraseña actual: al cambiarla, el enlace anterior deja de servir.
const huella = (hash: string) => createHash('sha256').update(hash || '').digest('hex').slice(0, 24);

function puedeEnviar(email: string): boolean {
  const ahora = Date.now();
  const recientes = (envios.get(email) || []).filter((t) => ahora - t < 15 * 60 * 1000);
  if (recientes.length >= 3) {
    envios.set(email, recientes);
    return false;
  }
  envios.set(email, [...recientes, ahora]);
  return true;
}

const escapar = (texto: string) =>
  texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export interface PasoMfa {
  paso: 'mfa';
  pase: string;
  configurado: boolean;
  metodo: Metodo | null;
  activos: Metodo[];
  email: string;
}

export interface AuthResult {
  token: string;
  user: {
    _id: string;
    name: string;
    lastname?: string;
    email: string;
    avatar?: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mfa: MfaService,
  ) {}

  // La contraseña sola no abre sesión: devuelve el pase para el segundo paso.
  async login(email: string, password: string): Promise<PasoMfa> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.active === false) {
      throw new UnauthorizedException('Esta cuenta fue suspendida');
    }

    const conMfa = await this.mfa.cargar(user._id.toString());
    const metodo = this.mfa.preferido(conMfa!);
    if (metodo === 'correo') await this.mfa.enviarCodigo(conMfa!);
    return {
      paso: 'mfa',
      pase: await this.jwtService.signAsync({ sub: user._id.toString(), tipo: 'mfa' }, { secret: secretoPase(), expiresIn: '10m' }),
      configurado: this.mfa.configurado(conMfa!),
      metodo,
      activos: this.mfa.activos(conMfa!),
      email: user.email,
    };
  }

  private async sesion(id: string): Promise<AuthResult> {
    const user = await this.usersService.findOne(id);
    const u = user as any;
    const token = await this.jwtService.signAsync({ sub: id, email: u.email, role: u.role });
    return {
      token,
      user: { _id: id, name: u.name, lastname: u.lastname, email: u.email, avatar: u.avatar, role: u.role },
    };
  }

  private async usuarioDelPase(pase: string) {
    let carga: { sub: string; tipo: string };
    try {
      carga = await this.jwtService.verifyAsync(pase || '', { secret: secretoPase() });
    } catch {
      throw new UnauthorizedException('El paso de verificación venció; vuelve a ingresar');
    }
    const u = carga.tipo === 'mfa' ? await this.mfa.cargar(carga.sub) : null;
    if (!u || (u as any).active === false) throw new UnauthorizedException('El paso de verificación venció; vuelve a ingresar');
    return u;
  }

  private async iniciarMetodo(u: any, metodo: Metodo) {
    if (metodo === 'totp') return this.mfa.iniciarTotp(u);
    if (!(await this.mfa.enviarCodigo(u))) {
      throw new HttpException('Pediste varios códigos seguidos; espera unos minutos', 429);
    }
    return { enviado: true };
  }

  private async activarMetodo(u: any, metodo: Metodo, codigo: string) {
    const ok = metodo === 'totp' ? await this.mfa.activarTotp(u, codigo) : await this.mfa.activarCorreo(u, codigo);
    if (!ok) throw new BadRequestException('El código no es correcto o ya venció');
  }

  async mfaConfigurar(pase: string, metodo: Metodo) {
    const u = await this.usuarioDelPase(pase);
    if (this.mfa.configurado(u)) throw new ConflictException('La verificación en dos pasos ya está configurada');
    return this.iniciarMetodo(u, metodo);
  }

  async mfaActivar(pase: string, metodo: Metodo, codigo: string): Promise<AuthResult> {
    const u = await this.usuarioDelPase(pase);
    if (this.mfa.configurado(u)) throw new ConflictException('La verificación en dos pasos ya está configurada');
    await this.activarMetodo(u, metodo, codigo);
    return this.sesion(u._id.toString());
  }

  async mfaReenviar(pase: string) {
    const u = await this.usuarioDelPase(pase);
    if (!this.mfa.activos(u).includes('correo')) throw new BadRequestException('El código por correo no está activo en tu cuenta');
    if (!(await this.mfa.enviarCodigo(u))) {
      throw new HttpException('Pediste varios códigos seguidos; espera unos minutos', 429);
    }
    return { detail: `Te enviamos un código a ${u.email}` };
  }

  async mfaVerificar(pase: string, metodo: Metodo, codigo: string): Promise<AuthResult> {
    const u = await this.usuarioDelPase(pase);
    if (!(await this.mfa.verificar(u, metodo, codigo))) {
      throw new UnauthorizedException('El código no es correcto o ya venció');
    }
    return this.sesion(u._id.toString());
  }

  async mfaEstado(userId: string) {
    const u = await this.mfa.cargar(userId);
    return { activos: this.mfa.activos(u!), preferido: this.mfa.preferido(u!) };
  }

  async mfaAgregar(userId: string, metodo: Metodo) {
    const u = await this.mfa.cargar(userId);
    if (this.mfa.activos(u!).includes(metodo)) throw new ConflictException('Ese método ya está activo');
    return this.iniciarMetodo(u, metodo);
  }

  async mfaAgregarActivar(userId: string, metodo: Metodo, codigo: string) {
    const u = await this.mfa.cargar(userId);
    await this.activarMetodo(u, metodo, codigo);
    return { activos: this.mfa.activos(u!), preferido: this.mfa.preferido(u!) };
  }

  async mfaPreferido(userId: string, metodo: Metodo) {
    const u = await this.mfa.cargar(userId);
    if (!(await this.mfa.elegirPreferido(u!, metodo))) throw new BadRequestException('Ese método no está activo');
    return { activos: this.mfa.activos(u!), preferido: this.mfa.preferido(u!) };
  }

  async recuperar(email: string): Promise<void> {
    const correo = email.trim();
    const user = await this.usersService.findByEmailWithPassword(correo);
    if (!user || user.active === false || !puedeEnviar(correo.toLowerCase())) return;

    const token = await this.jwtService.signAsync(
      { sub: user._id.toString(), h: huella(user.password || '') },
      { secret: secretoRecuperar(), expiresIn: `${RECUPERAR_MINUTOS}m` },
    );
    // El token va después de "#": el navegador no lo envía a ningún servidor.
    const origen = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
    const enlace = `${origen}/restablecer#${token}`;
    await enviarCorreo(
      user.email,
      user.name,
      'Restablece tu contraseña · ColombiaTech',
      `Hola ${user.name},\n\nPara crear una contraseña nueva abre este enlace (vence en ${RECUPERAR_MINUTOS} ` +
        `minutos y sirve una vez):\n\n${enlace}\n\nSi no fuiste tú, ignora este correo: tu contraseña no cambia.`,
      `<p>Hola ${escapar(user.name)},</p><p>Para crear una contraseña nueva en <strong>ColombiaTech</strong>:</p>` +
        `<p><a href="${escapar(enlace)}" style="background:#059669;color:#fff;padding:10px 18px;` +
        `border-radius:6px;text-decoration:none">Crear contraseña nueva</a></p><p>El enlace vence en ` +
        `${RECUPERAR_MINUTOS} minutos y sirve una sola vez. Si no fuiste tú, ignora este correo.</p>`,
    );
  }

  async restablecer(token: string, password: string): Promise<void> {
    let carga: { sub: string; h: string };
    try {
      carga = await this.jwtService.verifyAsync(token, { secret: secretoRecuperar() });
    } catch {
      throw new BadRequestException(ENLACE_INVALIDO);
    }
    const user = await this.usersService.findByIdWithPassword(carga.sub);
    const actual = Buffer.from(huella(user?.password || ''));
    const recibida = Buffer.from(String(carga.h || ''));
    if (!user || actual.length !== recibida.length || !timingSafeEqual(actual, recibida)) {
      throw new BadRequestException(ENLACE_INVALIDO);
    }
    await this.usersService.setPassword(carga.sub, password);
  }

  async cambiarContrasena(userId: string, actual: string, nueva: string): Promise<void> {
    const user = await this.usersService.findByIdWithPassword(userId);
    if (!user || !(await bcrypt.compare(actual, user.password || ''))) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }
    if (actual === nueva) {
      throw new BadRequestException('La contraseña nueva debe ser distinta de la actual');
    }
    await this.usersService.setPassword(userId, nueva);
  }
}