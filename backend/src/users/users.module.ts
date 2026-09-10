import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { UserSchema } from './user.schema';
import { UniqueEmailValidator } from './validations/unique-email.validator';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService, UsersResolver, UniqueEmailValidator],
  exports: [UsersService],
})
export class UsersModule {}
