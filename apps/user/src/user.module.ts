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


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PrismaModule,
    AuthModule,
    CloudinaryModule,
    RabbitMQModule,
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
