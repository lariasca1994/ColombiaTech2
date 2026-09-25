import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role?: string;
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
  // para que suspender una cuenta o cambiarle el rol tenga efecto
  // inmediato, sin esperar a que expire el token viejo.
  async validate(payload: JwtPayload) {
    let user: any;
    try {
      user = await this.usersService.findOne(payload.sub);
    } catch {
      // findOne lanza NotFoundException (o CastError si el id ya no es
      // válido) -- en ambos casos, para un guard de auth lo correcto es
      // un 401 uniforme, no dejar que se filtre un 404/500.
      throw new UnauthorizedException('Sesión inválida');
    }
    if (user.active === false) {
      throw new UnauthorizedException('Esta cuenta fue suspendida');
    }
    return { userId: payload.sub, email: payload.email, role: user.role };
  }
}
