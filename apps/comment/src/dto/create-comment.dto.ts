import { IsNotEmpty, IsNumber, IsString } from "class-validator";


export class CreateCommentDto {
    @IsNumber()
    @IsNotEmpty()
    postId: number;

    @IsNotEmpty()
    @IsString()
    content: string;
}