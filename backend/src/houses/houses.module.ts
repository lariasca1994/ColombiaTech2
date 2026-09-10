import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HousesService } from './houses.service';
import { HousesController } from './houses.controller';
import { HousesResolver } from './houses.resolver';
import { HouseSchema } from './house.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'House', schema: HouseSchema }]),
  ],
  controllers: [HousesController],
  providers: [HousesService, HousesResolver],
  exports: [HousesService],
})
export class HousesModule {}
