import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { EditUserDto, SigninDto, SignupDto } from '../dto';
import { JwtGuard } from '../guard/jwt.guard';
import { GetUser } from '../decorator';
import { User } from '@prisma/client';

@Controller('/api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Post('auth/signup')
  signUp(@Body() dto : SignupDto) {
    return this.userService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('auth/signin')
  signin(@Body() dto : SigninDto) {
    return this.userService.signin(dto);
  }

  //protected Routes:
  @UseGuards(JwtGuard)
  @Get('profile')
  getUserProfile(@GetUser() user: User) {
    return user;
  }

  @UseGuards(JwtGuard)
  @Patch('edit/profile')
  EditUserProfile(@GetUser('id') userId: number, @Body() dto: EditUserDto){
    return this.userService.editUser(userId, dto)
  }

  //Upload image profile
}
