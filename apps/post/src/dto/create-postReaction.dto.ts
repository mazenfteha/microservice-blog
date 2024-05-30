import { IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';


export class CreatePostReactionDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: 1, description: 'The id of the post' })

    postId: number;

    @IsNotEmpty()
    @ApiProperty({ example: 'LIKE', description: 'The reaction of the post' })
    reactionType: 'LIKE' | 'DISLIKE';
}