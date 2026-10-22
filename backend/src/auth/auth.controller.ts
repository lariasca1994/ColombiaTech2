import { Body, Controller, Get, Post, HttpCode, Req, UseGuards } from '@nestjs/common';
import { AuthService, AuthResult, PasoMfa } from './auth.service';
import { MfaCodigoDto, MfaMetodoDto, MfaPaseDto } from './dto/mfa.dto';
import { LoginDto } from './dto/login.dto';
import { CambiarContrasenaDto, RecuperarDto, RestablecerDto } from './dto/contrasena.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto): Promise<PasoMfa> {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  // ─── Verificación en dos pasos (con el pase del login) ───
  @Post('mfa/configurar')
  @HttpCode(200)
  async mfaConfigurar(@Body() dto: MfaMetodoDto) {
    return this.authService.mfaConfigurar(dto.pase || '', dto.metodo);
  }

  @Post('mfa/activar')
  @HttpCode(200)
  async mfaActivar(@Body() dto: MfaCodigoDto): Promise<AuthResult> {
    return this.authService.mfaActivar(dto.pase || '', dto.metodo, dto.codigo);
  }

  @Post('mfa/correo')
  @HttpCode(202)
  async mfaReenviar(@Body() dto: MfaPaseDto) {
    return this.authService.mfaReenviar(dto.pase);
  }

  @Post('mfa/verificar')
  @HttpCode(200)
  async mfaVerificar(@Body() dto: MfaCodigoDto): Promise<AuthResult> {
    return this.authService.mfaVerificar(dto.pase || '', dto.metodo, dto.codigo);
  }

  // ─── Seguridad del perfil (con sesión) ───
  @UseGuards(JwtAuthGuard)
  @Get('mfa')
  async mfaEstado(@Req() req) {
    return this.authService.mfaEstado(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/agregar')
  @HttpCode(200)
  async mfaAgregar(@Body() dto: MfaMetodoDto, @Req() req) {
    return this.authService.mfaAgregar(req.user.userId, dto.metodo);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/agregar/activar')
  @HttpCode(200)
  async mfaAgregarActivar(@Body() dto: MfaCodigoDto, @Req() req) {
    return this.authService.mfaAgregarActivar(req.user.userId, dto.metodo, dto.codigo);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/preferido')
  @HttpCode(200)
  async mfaPreferido(@Body() dto: MfaMetodoDto, @Req() req) {
    return this.authService.mfaPreferido(req.user.userId, dto.metodo);
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
