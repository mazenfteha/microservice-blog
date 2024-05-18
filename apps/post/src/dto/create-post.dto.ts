import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    content: string;

    @IsString()
    @IsOptional()
    category? : string;

    @IsString()
    @IsOptional()
    tags? : string;

    @IsString()
    @IsOptional()
    status? :string;

    @IsString()
    @IsOptional()
    imageUrl?: string;
}