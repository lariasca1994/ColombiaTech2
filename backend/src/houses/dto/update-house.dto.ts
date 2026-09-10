import { PartialType, InputType } from '@nestjs/graphql';
import { CreateHouseDto } from './create-house.dto';

@InputType()
export class UpdateHouseDto extends PartialType(CreateHouseDto) {}
