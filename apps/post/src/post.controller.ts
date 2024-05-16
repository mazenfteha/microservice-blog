import { Controller, Get, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtGuard } from '../../../libs/comman/src/';

@UseGuards(JwtGuard)
@Controller('/api/posts')
export class PostController {
  constructor(private readonly postService: PostService) {}
  
  @Get()
  getHello(): string {
    return this.postService.getHello();
  }
}
