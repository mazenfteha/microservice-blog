import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SigninDto, SignupDto } from '../dto';
import { JwtGuard } from '../guard/jwt.guard';
import { Request } from 'express';

@Controller('/api/auth')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Post('signup')
  signUp(@Body() dto : SignupDto) {
    return this.userService.signup(dto);
  }

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
  getUsers(@Req() req: Request) {
    return req.user;
  }
}
