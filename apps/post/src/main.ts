import { NestFactory } from '@nestjs/core';
import { PostModule } from './post.module';

async function bootstrap() {
  const app = await NestFactory.create(PostModule);
  await app.listen(3000);
}
bootstrap();
