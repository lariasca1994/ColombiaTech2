import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  Validate,
} from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { UniqueEmailValidator } from '../validations/unique-email.validator';

@InputType()
export class CreateUserDto {
  @Field()
  @IsNotEmpty()
  @MinLength(3, { message: 'El nombre debe tener mínimo 3 letras' })
  @IsString()
  readonly name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  readonly lastname?: string;

  @Field()
  @IsNotEmpty()
  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  @Validate(UniqueEmailValidator)
  readonly email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/, {
    message:
      'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial',
  })
  readonly password: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  readonly avatar?: string;
}
