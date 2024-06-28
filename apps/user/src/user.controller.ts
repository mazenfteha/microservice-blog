import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, ParseFilePipeBuilder, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { EditUserDto, SigninDto, SignupDto } from './dto';
import { JwtGuard } from '../../../libs/comman/src';
import { GetUser } from './decorator';
import { User } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateFollowDto } from './dto/create-follow.dto';
import { DeleteFollowDto } from './dto/delete-follow.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';

const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 2 * 1024 * 1024;

@ApiTags('Users')
@Controller('/api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({ status: 201, description: 'User successfully signed up' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @Post('auth/signup')
  signUp(@Body() dto : SignupDto) {
    return this.userService.signup(dto);
  }

  @ApiOperation({ summary: 'Sign in a user' })
  @ApiResponse({ status: 201, description: 'User successfully signed in' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @HttpCode(HttpStatus.OK)
  @Post('auth/signin')
  signin(@Body() dto : SigninDto) {
    return this.userService.signin(dto);
  }

  //protected Routes:
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully'})
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @UseGuards(JwtGuard)
  @UseInterceptors(CacheInterceptor)
  @Get('profile')
  getUserProfile(@GetUser() user: User) {
    return user;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully'})
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Invalid input.' })
  @UseGuards(JwtGuard)
  @Patch('edit/profile')
  EditUserProfile(@GetUser('id') userId: number, @Body() dto: EditUserDto){
    return this.userService.editUser(userId, dto)
  }

  //Upload image profile
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload profile image' })
  @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Invalid input.' })
  @UseGuards(JwtGuard)
  @Post('upload/profile/image')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(
    @GetUser('id') userId: number,
    @UploadedFile(
    new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ })
        .addMaxSizeValidator({ maxSize: MAX_PROFILE_PICTURE_SIZE_IN_BYTES })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
  ) file, ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.userService.updateUserProfileImage(userId, file.buffer);
  }

  // Delete Profile Image
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete profile image' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Invalid input.' })
  @UseGuards(JwtGuard)
  @Delete('delete/profile/image')
  async deleteProfileImage(@GetUser('id') userId: number) {
    return this.userService.deleteUserProfileImage(userId);
  }

  // Follow API
  // Create Follow
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create follow' })
  @ApiResponse({ status: 200, description: 'Follow created successfully' })
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Invalid input.' })
  @UseGuards(JwtGuard)
  @Post('follow')
  async createFollow(@GetUser('id') userId: number,@Body() dto: CreateFollowDto){
    return this.userService.createFollow(userId, dto);
  }

  //unFollow
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete follow' })
  @ApiResponse({ status: 200, description: 'Follow deleted successfully' })
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Invalid input.' })
  @UseGuards(JwtGuard)
  @Post('unfollow')
  async deleteFollow( @GetUser('id') userId: number,@Body() dto: DeleteFollowDto){
    return this.userService.deleteFollow(userId, dto);
  }

  //Get followers
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get followers' })
  @ApiResponse({ status: 200, description: 'Followers retrieved successfully' })
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Invalid input.' })
  @UseGuards(JwtGuard)
  @UseInterceptors(CacheInterceptor)
  @Get('get/followers')
  async getFollowers(@GetUser('id') userId: number){
    return this.userService.getFollowers(userId);
  }

  //Get following
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get following' })
  @ApiResponse({ status: 200, description: 'Following retrieved successfully' })
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Invalid input.' })
  @UseGuards(JwtGuard)
  @UseInterceptors(CacheInterceptor)
  @Get('get/following')
  async getFollowing(@GetUser('id') userId: number){
    return this.userService.getFollowing(userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  sayHello(){
    return 'Hello World!';
  }
}
