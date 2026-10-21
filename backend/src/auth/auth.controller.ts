import { Body, Controller, Post, HttpCode, Req, UseGuards } from '@nestjs/common';
import { AuthService, AuthResult } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CambiarContrasenaDto, RecuperarDto, RestablecerDto } from './dto/contrasena.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto): Promise<AuthResult> {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  // Siempre 202, exista o no la cuenta: no revela qué correos están registrados.
  @Post('recuperar')
  @HttpCode(202)
  async recuperar(@Body() dto: RecuperarDto): Promise<void> {
    await this.authService.recuperar(dto.email);
  }

  @Post('restablecer')
  @HttpCode(204)
  async restablecer(@Body() dto: RestablecerDto): Promise<void> {
    await this.authService.restablecer(dto.token, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cambiar-contrasena')
  @HttpCode(204)
  async cambiarContrasena(@Body() dto: CambiarContrasenaDto, @Req() req): Promise<void> {
    await this.authService.cambiarContrasena(req.user.userId, dto.actual, dto.nueva);
  }
}
