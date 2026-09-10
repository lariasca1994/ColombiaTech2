import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

import { UsersModule } from './users/users.module';
import { HousesModule } from './houses/houses.module';
import { MessagesModule } from './messages/messages.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';

if (!process.env.DB_URL) {
  throw new Error(
    'Falta DB_URL en el archivo .env — copia .env-ejemplo a .env y complétalo.',
  );
}

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DB_URL),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),
    UsersModule,
    HousesModule,
    MessagesModule,
    AuthModule,
    UploadModule,
  ],
})
export class AppModule {}