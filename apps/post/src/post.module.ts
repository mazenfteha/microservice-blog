import { Module, Logger, MiddlewareConsumer,NestModule } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { AuthModule } from '@app/comman/auth/auth.module';
import { PrismaModule } from '@app/comman/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from '@app/comman/cloudinary/cloudinary.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RabbitMQModule } from '@app/comman/rabbitmq/rabbitmq.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore }  from 'cache-manager-redis-yet';
import { LoggingMiddleware } from '../../../libs/comman/src/middlewares/logging.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PrismaModule,
    CloudinaryModule,
    AuthModule,
    RabbitMQModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 6 * 10000,
      store: redisStore, 
      host: 'localhost',
      port: 6379,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
  ],
  controllers: [PostController],
  providers: [PostService, Logger,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class PostModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*')
  }
}
