import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { join } from 'path';
import * as dns from 'node:dns';

// FIX: en Windows, Node.js a veces no usa el resolutor DNS del sistema
// correctamente para los registros SRV que usa MongoDB Atlas
// (mongodb+srv://), lo que produce "querySrv ECONNREFUSED" aunque la
// cadena de conexión y la contraseña estén perfectas. Forzar DNS públicos
// evita el problema. Debe ejecutarse ANTES de importar AppModule/conectar
// a Mongo.
dns.setServers(['1.1.1.1', '8.8.8.8']);

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // FIX: sin esto, class-validator crea sus propios validadores custom
  // (@Validate) con `new`, en vez de pedírselos al contenedor de Nest —
  // así que UniqueEmailValidator nunca recibe su @InjectModel('User') y
  // truena con 500 al intentar usar un userModel undefined.
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Sirve la carpeta uploads/ como archivos estáticos (fotos de usuarios y casas)
  app.useStaticAssets(join(process.cwd(), 'uploads'));

  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Servidor escuchando en el puerto ${port}`);
}
bootstrap();
