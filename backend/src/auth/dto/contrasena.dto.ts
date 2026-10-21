import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

// La misma regla del registro (ver users/dto/create-user.dto.ts).
const REGLA = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/;
const MENSAJE =
  'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial';

export class RecuperarDto {
  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  readonly email: string;
}

export class RestablecerDto {
  @IsNotEmpty()
  @IsString()
  readonly token: string;

  @IsString()
  @Matches(REGLA, { message: MENSAJE })
  readonly password: string;
}

export class CambiarContrasenaDto {
  @IsNotEmpty()
  @IsString()
  readonly actual: string;

  @IsString()
  @Matches(REGLA, { message: MENSAJE })
  readonly nueva: string;
}
