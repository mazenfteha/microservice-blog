import { NestFactory } from '@nestjs/core';
import { BookmarkModule } from './bookmark.module';

async function bootstrap() {
  const app = await NestFactory.create(BookmarkModule);
  await app.listen(3000);
}
bootstrap();
