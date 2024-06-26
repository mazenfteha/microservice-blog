import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtGuard } from '../../../libs/comman/src/';
import { CreatePostDto } from './dto/create-post.dto';
import { GetUser } from 'apps/user/src/decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { EditPostDto } from './dto/edit-post.dto';
import { CreatePostReactionDto } from './dto/create-postReaction.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';


const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 2 * 1024 * 1024;

@ApiTags('Posts')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('/api/posts')
export class PostController {
  constructor(private readonly postService: PostService) {}
  

  @ApiOperation({ summary: 'create post' })
  @ApiResponse({ status: 200, description: 'post created successfully'})
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
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
  
  
  @ApiOperation({ summary: 'get all posts' })
  @ApiResponse({ status: 200, description: 'posts retrieved successfully'})
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @UseInterceptors(CacheInterceptor)
  @Get()
  GetAllPosts() {
    return this.postService.getAllPosts()
  }

  @ApiOperation({ summary: 'get all posts (user posts)' })
  @ApiResponse({ status: 200, description: 'posts retrieved successfully'})
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @UseInterceptors(CacheInterceptor)
  @Get('get/user/posts')
  getUserPosts(@GetUser('id') userId: number) {
    return this.postService.getUserPosts(userId)
  }

  @ApiOperation({ summary: 'get post' })
  @ApiResponse({ status: 200, description: 'post retrieved successfully'})
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @UseInterceptors(CacheInterceptor)
  @Get(':id')
  getPostById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) postId: number) {
    return this.postService.getPostById(userId, postId)
  }


  @ApiOperation({ summary: 'update post' })
  @ApiResponse({ status: 200, description: 'posts updated successfully'})
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @Patch(':id')
  editPostById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) postId: number,
    @Body() dto : EditPostDto
    ) {
      return this.postService.editPostById(userId, postId, dto)
    }


  @ApiOperation({ summary: 'delete post' })
  @ApiResponse({ status: 200, description: 'posts deleted successfully'})
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @Delete(':id')
  deletePostById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) postId: number) {
    return this.postService.deletePostById(userId, postId)
  }

  @ApiOperation({ summary: 'create reaction to post' })
  @ApiResponse({ status: 200, description: 'reaction created successfully'})
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @Post('reactions/create')
  createReaction(
    @GetUser('id') userId: number,
    @Body() dto : CreatePostReactionDto
  ){
    return this.postService.createReaction(userId, dto.postId, dto.reactionType)
  }

  @ApiOperation({ summary: 'deleted reaction to post' })
  @ApiResponse({ status: 200, description: 'reaction deleted successfully'})
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @Delete('reactions/:id')
  deleteReaction(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) reactionId: number
  ) {
    return this.postService.deleteReaction(userId, reactionId)
  }
}
