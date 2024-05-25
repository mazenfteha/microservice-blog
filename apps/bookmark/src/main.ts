import { NestFactory } from '@nestjs/core';
import { BookmarkModule } from './bookmark.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(BookmarkModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }));
  await app.listen(3003);
}
bootstrap();
