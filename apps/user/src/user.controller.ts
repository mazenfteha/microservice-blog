import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { SigninDto, SignupDto } from '../dto';

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

  @Post('signout')
  signout() {
    return this.userService.signout();
  }
}
