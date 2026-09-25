import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from './roles.decorator';

/**
 * Va siempre después de JwtAuthGuard (@UseGuards(JwtAuthGuard, RolesGuard)):
 * asume que request.user ya existe. Funciona tanto para REST como para los
 * resolvers de GraphQL (ambos comparten JwtStrategy/JwtAuthGuard).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const user = this.getUser(context);
    return !!user && requiredRoles.includes(user.role);
  }

  private getUser(context: ExecutionContext): any {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest().user;
    }
    const gqlContext = GqlExecutionContext.create(context).getContext();
    return gqlContext?.req?.user;
  }
}
