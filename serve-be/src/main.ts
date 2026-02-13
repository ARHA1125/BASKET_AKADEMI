import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ensureDatabaseExists } from './utils/ensure-database.util';

async function bootstrap() {
  await ensureDatabaseExists();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
       'http://localhost:3000',
       'https://app.wirabhakti.my.id', 
       'https://wirabhakti.my.id',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();
