import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { AuthModule } from '@app/comman/auth/auth.module';
import { PrismaModule } from '@app/comman/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from '@app/comman/cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PrismaModule,
    CloudinaryModule,
    AuthModule,
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
