import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Todas las rutas quedan bajo /api (ej: /api/auth/login)
  app.setGlobalPrefix('api');

  // Solo el front puede llamar a la API.
  // FRONTEND_URL acepta varias URLs separadas por coma (ej: local + Vercel).
  app.enableCors({
    origin: (process.env.FRONTEND_URL ?? 'http://localhost:4200')
      .split(',')
      .map((url) => url.trim().replace(/\/$/, '')),
  });

  // Valida cada body contra su DTO; si algo no cumple, responde 400 automáticamente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // descarta campos que no estén en el DTO
      forbidNonWhitelisted: true, // y si mandan campos de más, 400
      transform: true, // convierte tipos (ej: "2000-01-01" -> Date)
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
