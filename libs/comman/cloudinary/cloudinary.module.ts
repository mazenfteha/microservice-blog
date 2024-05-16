import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';

@Module({
    imports: [ConfigModule],
    providers: [
        CloudinaryService,
        {
            provide: 'Cloudinary',
            useFactory: (configService: ConfigService) => {
                cloudinary.config({
                    cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
                    api_key: configService.get<string>('CLOUDINARY_API_KEY'),
                    api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
                });
                return cloudinary;
            },
            inject: [ConfigService],
        },
    ],
    exports: [CloudinaryService],
})
export class CloudinaryModule { }