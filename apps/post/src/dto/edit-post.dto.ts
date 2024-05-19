import { IsOptional, IsString } from "class-validator";

export class EditPostDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    content?: string;

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