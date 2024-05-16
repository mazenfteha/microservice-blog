import { Controller, Get, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtGuard } from '../../../libs/comman/src/';

@UseGuards(JwtGuard)
@Controller('/api/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  getHello(): string {
    return this.commentService.getHello();
  }
}
