import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Formato de correo inválido' })
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
