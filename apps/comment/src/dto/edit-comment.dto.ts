import {IsOptional, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class EditCommentDto {

    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'optional comment', description: 'The content of the comment' })
    content?: string;
}