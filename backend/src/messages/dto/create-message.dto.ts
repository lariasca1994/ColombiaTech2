import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateMessageDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  readonly body: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsMongoId()
  readonly from: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsMongoId()
  readonly to: string;
}
