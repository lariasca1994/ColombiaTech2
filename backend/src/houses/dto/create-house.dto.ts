import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class CreateHouseDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  readonly address: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  readonly city: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  readonly state: string;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  readonly size: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  readonly type: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  readonly zip_code: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  readonly rooms: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  readonly bathrooms: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  readonly parking: string;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  readonly price: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  readonly code: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  readonly image?: string;
}
