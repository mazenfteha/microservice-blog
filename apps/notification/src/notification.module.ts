import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { AuthModule } from '@app/comman/auth/auth.module';
import { PrismaModule } from '@app/comman/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RabbitMQModule } from '@app/comman/rabbitmq/rabbitmq.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore }  from 'cache-manager-redis-yet';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PrismaModule,
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
  controllers: [NotificationController],
  providers: [NotificationService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class NotificationModule {}
