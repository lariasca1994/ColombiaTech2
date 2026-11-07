import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role?: string;
  iat?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  // Lo que retorna aquí queda disponible como `request.user` en cualquier
  // controlador protegido con JwtAuthGuard. Se relee el usuario de la base
  // en cada request (en vez de confiar ciegamente en el `role` del token)
  // para que suspender una cuenta, cambiarle el rol o restablecer su
  // contraseña tenga efecto inmediato, sin esperar a que expire el token viejo.
  async validate(payload: JwtPayload) {
    // findByIdWithMfa devuelve null si el usuario no existe o el id no es
    // válido: para un guard de auth lo correcto es un 401 uniforme.
    const user: any = await this.usersService.findByIdWithMfa(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Sesión inválida');
    }
    if (user.active === false) {
      throw new UnauthorizedException('Esta cuenta fue suspendida');
    }
    // Al restablecer la contraseña se cierran todas las sesiones abiertas:
    // los tokens emitidos antes de ese momento ya no valen.
    if ((payload.iat || 0) < (user.mfa?.sesiones_desde || 0)) {
      throw new UnauthorizedException('La sesión se cerró; vuelve a ingresar');
    }
    return { userId: payload.sub, email: payload.email, role: user.role };
  }
}
