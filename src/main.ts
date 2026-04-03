import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,  // needed later for Stripe webhooks
  });

  // security headers — protects against XSS, clickjacking etc
  app.use(helmet());

  // cors — only allow your Next.js frontend
  app.enableCors({
    origin: [
      'http://localhost:3000',       // Next.js dev
      'https://yourstore.com',       // production later
    ],
    methods:     ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // global prefix — all routes become /api/v1/...
  app.setGlobalPrefix('api/v1');

  // validation — strips unknown fields, transforms types
  app.useGlobalPipes(new ValidationPipe({
    whitelist:            true,
    forbidNonWhitelisted: true,
    transform:            true,
  }));

  await app.listen(process.env.PORT ?? 4000);
  console.log(`NestJS running on http://localhost:5000/api/v1`);
}

bootstrap();