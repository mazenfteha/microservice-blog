import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtGuard } from '../../../libs/comman/src/';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetUser } from 'apps/user/src/decorator';

@UseGuards(JwtGuard)
@Controller('/api/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}


  @Post('create')
  createComment(@GetUser('id') userId: number, @Body() createCommentDto: CreateCommentDto) {
    return this.commentService.createComment(userId, createCommentDto);
  }
}
