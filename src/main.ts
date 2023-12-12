import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { CorsConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(new CorsConfig().getCorsOptions());

  await app.listen(8000);
}

bootstrap();
