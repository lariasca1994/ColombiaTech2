import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Este es exactamente el guard que faltaba en el proyecto original: ni
 * houses.controller.ts, ni users.controller.ts, ni messages.controller.ts
 * tenían ningún @UseGuards — la API entera estaba abierta sin
 * autenticación real, más allá de que el frontend ocultara rutas con
 * PrivateRoute (eso solo afecta la navegación visual, no la API).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
