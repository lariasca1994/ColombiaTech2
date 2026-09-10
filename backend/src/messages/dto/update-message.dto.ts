import { IsBoolean, IsOptional } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateMessageDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  readonly readed?: boolean;
}
