import { BadRequestException, Body, Controller, Get, HttpStatus, ParseFilePipeBuilder, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtGuard } from '../../../libs/comman/src/';
import { PrismaService } from '@app/comman/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { GetUser } from 'apps/user/src/decorator';
import { FileInterceptor } from '@nestjs/platform-express';

const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 2 * 1024 * 1024;


@UseGuards(JwtGuard)
@Controller('/api/posts')
export class PostController {
  userService: any;
  constructor(private readonly postService: PostService, private prisma: PrismaService,) {}
  
  @Post('create')
  createPost(@GetUser('id') userId: number,@Body() createPostDto: CreatePostDto) {
    return this.postService.createPost(userId , createPostDto)
  }

  @Post('upload/image')
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
    return this.postService.uploadPostImage(userId, file.buffer);
  }

  @Get()
  getHello(): string {
    return this.postService.getHello();
  }
}
