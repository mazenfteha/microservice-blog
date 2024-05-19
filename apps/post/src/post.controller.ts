import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtGuard } from '../../../libs/comman/src/';
import { CreatePostDto } from './dto/create-post.dto';
import { GetUser } from 'apps/user/src/decorator';
import { FileInterceptor } from '@nestjs/platform-express';

const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 2 * 1024 * 1024;


@UseGuards(JwtGuard)
@Controller('/api/posts')
export class PostController {
  constructor(private readonly postService: PostService) {}
  

  @Post('create')
  @UseInterceptors(FileInterceptor('file'))
  public async createPost(
    @GetUser('id') userId: number,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File, ) {

    let imageUrl: string | undefined;

    if (file) {
      if (file.mimetype !== 'image/jpeg') {
        throw new BadRequestException('Invalid file type. Only JPEG images are allowed.');
      }
      if (file.size > MAX_PROFILE_PICTURE_SIZE_IN_BYTES) {
        throw new BadRequestException('File size exceeds the maximum limit of 1 MB.');
      }
      // Upload image and get URL
      const result = await this.postService.uploadPostImage(userId, file.buffer);
      imageUrl = result.url;
    }
    // Create post with the image URL
    return this.postService.createPost(userId, {
      ...createPostDto,
      imageUrl,
    });
  }
  
  @Get()
  GetAllPosts() {
    return this.postService.getAllPosts()
  }
  @Get('get/user/posts')
  getUserPosts(@GetUser('id') userId: number) {
    return this.postService.getUserPosts(userId)
  }

  @Get(':id')
  getPostById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) postId: number) {
    return this.postService.getPostById(userId, postId)
  }


}
