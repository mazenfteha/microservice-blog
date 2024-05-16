import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../prisma/prisma.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt.strategy";


@Module({
    imports: [
        ConfigModule,
        PassportModule,
        JwtModule.register({}),
        PrismaModule,
    ],
    providers: [JwtStrategy],
    exports: [JwtModule, JwtStrategy],
})

export class AuthModule {}