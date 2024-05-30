import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class SigninDto {
    @IsEmail({}, { message: 'Email must be valid' })
    @IsNotEmpty()
    @ApiProperty({ example: 'john.doe@example.com', description: 'The email of the user' })
    email: string;

    @IsString()
    @IsNotEmpty()
    @Length(8, 20, { message: 'Password must be between 8 and 20 characters' })
    @ApiProperty({ example: 'strongPassword123', description: 'The password of the user' })
    password : string;
}