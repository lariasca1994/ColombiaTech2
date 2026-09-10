import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UsersModule } from '../users/users.module';
import { HousesModule } from '../houses/houses.module';

@Module({
  imports: [UsersModule, HousesModule],
  controllers: [UploadController],
})
export class UploadModule {}
