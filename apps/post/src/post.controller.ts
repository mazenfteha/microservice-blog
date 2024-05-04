import { Controller, Get } from '@nestjs/common';
import { PostService } from './post.service';

@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  getHello(): string {
    return this.postService.getHello();
  }
}
