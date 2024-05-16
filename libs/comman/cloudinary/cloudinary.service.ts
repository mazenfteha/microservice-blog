import { Injectable, Inject } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse} from 'cloudinary';

@Injectable()
export class CloudinaryService {
    constructor(@Inject('Cloudinary') private readonly cloudinary) { }

    async uploadImage(imageBuffer: Buffer, folder: string): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream = this.cloudinary.uploader.upload_stream(
                { folder },
                (error: UploadApiErrorResponse, result: UploadApiResponse) => {
                    if (error) {
                        reject(new Error('Failed to upload image to Cloudinary'));
                    } else {
                        resolve(result);
                    }
                },
            );
            uploadStream.end(imageBuffer);
        });
    } async deleteImage(imageUrl: string): Promise<any> {
        const publicId = this.extractPublicId(imageUrl);
        if (!publicId) {
            throw new Error('Invalid Cloudinary image URL');
        }

        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(publicId, (error: UploadApiErrorResponse, result: any) => {
                if (error) {
                    reject(new Error('Failed to delete image from Cloudinary'));
                } else {
                    resolve(result);
                }
            });
        });
    }

    private extractPublicId(imageUrl: string): string {
        const matches = imageUrl.match(/\/v\d+\/(.+)\.\w+$/);
        return matches ? matches[1] : null;
    }
}
