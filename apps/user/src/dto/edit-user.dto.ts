import { IsEmail, IsOptional, IsString} from "class-validator";
import { ApiProperty } from '@nestjs/swagger';


export class EditUserDto {

    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
    name?: string;

    @IsEmail({}, { message: 'Email must be valid' })
    @IsOptional()
    @ApiProperty({ example: 'john.doe@example.com', description: 'The email of the user' })
    email?: string;
}