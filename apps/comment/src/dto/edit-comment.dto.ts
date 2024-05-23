import {IsOptional, IsString } from "class-validator";


export class EditCommentDto {

    @IsOptional()
    @IsString()
    content?: string;
}