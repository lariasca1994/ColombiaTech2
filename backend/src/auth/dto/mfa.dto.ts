import { IsIn, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import type { Metodo } from '../mfa.service';

export class MfaPaseDto {
  @IsString()
  @MaxLength(600)
  readonly pase: string;
}

export class MfaMetodoDto {
  @IsOptional()
  @IsString()
  @MaxLength(600)
  readonly pase?: string;

  @IsIn(['totp', 'correo'])
  readonly metodo: Metodo;
}

export class MfaCodigoDto extends MfaMetodoDto {
  @IsString()
  @Length(6, 8)
  readonly codigo: string;
}
