import { IsNotEmpty, IsNumber } from "class-validator";


export class CreatePostReactionDto {
    @IsNumber()
    @IsNotEmpty()
    postId: number;

    @IsNotEmpty()
    reactionType: 'LIKE' | 'DISLIKE';
}