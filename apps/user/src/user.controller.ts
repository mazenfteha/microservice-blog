import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SigninDto, SignupDto } from '../dto';
import { JwtGuard } from '../guard/jwt.guard';
import { GetUser } from '../decorator';
import { User } from '@prisma/client';

@Controller('/api/auth')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Post('signup')
  signUp(@Body() dto : SignupDto) {
    return this.userService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto : SigninDto) {
    return this.userService.signin(dto);
  }

  //protected Routes:
  @Post('signout')
  signout() {
    return this.userService.signout();
  }

  @UseGuards(JwtGuard)
  @Get('users')
  getUsers(@GetUser() user: User) {
    return user;
  }
}
