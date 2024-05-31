import { IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';


export class CreateBookmarkDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: 1, description: 'The id of the post' })
    postId: number;
}