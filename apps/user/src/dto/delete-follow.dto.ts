import { IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class DeleteFollowDto {

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: 1, description: 'The id of the follower' })

    followerId: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: 2, description: 'The id of the follwing' })
    followingId: number;
}