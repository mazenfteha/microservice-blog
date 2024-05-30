import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';


export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'A Day in the Life', description: 'The title of the post' })
    title: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Today was a beautiful day...', description: 'The content of the post' })
    content: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'Lifestyle', description: 'The category of the post', required: false })
    category?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'fun, life', description: 'Comma-separated tags related to the post', required: false })
    tags?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'draft', description: 'The status of the post', required: false })
    status?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'http://example.com/image.jpg', description: 'URL of the image associated with the post', required: false })
    imageUrl?: string;
}