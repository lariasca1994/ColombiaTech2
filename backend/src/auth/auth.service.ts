import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash, timingSafeEqual } from 'node:crypto';
import { UsersService } from '../users/users.service';
import { enviarCorreo } from './correo';

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
  ) {}

  async login(email: string, password: string): Promise<AuthResult> {
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

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      user: {
        _id: user._id.toString(),
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    };
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