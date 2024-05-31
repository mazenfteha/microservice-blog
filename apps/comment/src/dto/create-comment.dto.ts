import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';


export class CreateCommentDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: 1, description: 'The id of the post' })
    postId: number;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'first comment', description: 'The content of the comment' })
    content: string;
}