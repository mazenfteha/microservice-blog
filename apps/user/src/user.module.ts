import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../../../libs/comman/src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../../../libs/comman/src/auth/auth.module';
import { CloudinaryModule } from '../../../libs/comman/src/cloudinary/cloudinary.module';
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
    CloudinaryModule,
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
  controllers: [UserController],
  providers: [UserService, 
    {
    provide: APP_GUARD,
    useClass: ThrottlerGuard
    }
  ],
})
export class UserModule {}
