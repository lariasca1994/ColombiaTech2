import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import type { NextFunction, Request, Response } from 'express';
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

  // Mantenimiento: si MongoDB no esta conectado, la API responde 503 al
  // instante (con CORS, por eso va despues de enableCors) en vez de dejar la
  // peticion colgada ~10 s y terminar en un 500. El frontend lo convierte en
  // su pantalla de mantenimiento. /health responde 200 solo con la base arriba.
  const conexion = app.get<Connection>(getConnectionToken());
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (conexion.readyState === 1 || req.method === 'OPTIONS') return next();
    res.setHeader('Retry-After', '300');
    res.status(503).json({ message: 'Servicio en mantenimiento', mantenimiento: true });
  });
  app.getHttpAdapter().get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));
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
