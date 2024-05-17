import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, ParseFilePipeBuilder, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { EditUserDto, SigninDto, SignupDto } from './dto';
import { JwtGuard } from '../../../libs/comman/src';
import { GetUser } from './decorator';
import { User } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 2 * 1024 * 1024;

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
  @UseGuards(JwtGuard)
  @Post('upload/profile/image')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(
    @GetUser('id') userId: number,
    @UploadedFile(
    new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: 'image/jpeg' })
        .addMaxSizeValidator({ maxSize: MAX_PROFILE_PICTURE_SIZE_IN_BYTES })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
  ) file, ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.userService.updateUserProfileImage(userId, file.buffer);
  }

  // Delete Profile Image
  @UseGuards(JwtGuard)
  @Delete('delete/profile/image')
  async deleteProfileImage(@GetUser('id') userId: number) {
    return this.userService.deleteUserProfileImage(userId);
  }

}
