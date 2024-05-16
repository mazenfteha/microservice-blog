import { Controller, Get, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtGuard } from '../../../libs/comman/src/';
import { PrismaService } from '@app/comman/prisma/prisma.service';

@UseGuards(JwtGuard)
@Controller('/api/posts')
export class PostController {
  constructor(private readonly postService: PostService, private prisma: PrismaService,) {}
  
  @Get()
  getHello(): string {
    return this.postService.getHello();
  }
}
