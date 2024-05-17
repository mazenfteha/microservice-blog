import { IsNotEmpty, IsNumber } from "class-validator";

export class DeleteFollowDto {

    @IsNumber()
    @IsNotEmpty()
    followerId: number;

    @IsNumber()
    @IsNotEmpty()
    followingId: number;
}