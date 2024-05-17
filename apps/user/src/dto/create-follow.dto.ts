import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateFollowDto {

    @IsNumber()
    @IsNotEmpty()
    followerId: number;

    @IsNumber()
    @IsNotEmpty()
    followingId: number;
}