import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtGuard } from '../../../libs/comman/src/';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetUser } from 'apps/user/src/decorator';
import { EditCommentDto } from './dto/edit-comment.dto';

@UseGuards(JwtGuard)
@Controller('/api/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}


  @Post('create')
  createComment(@GetUser('id') userId: number, @Body() createCommentDto: CreateCommentDto) {
    return this.commentService.createComment(userId, createCommentDto);
  }

  @Get(':id')
  getPostById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) commentId: number) {
    return this.commentService.getCommentById(userId, commentId)
  }

  @Patch(':id')
  editPostById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) commentId: number,
    @Body() dto : EditCommentDto
    ) {
      return this.commentService.editCommentById(userId, commentId, dto)
    }

  @Delete(':id')
  deleteCommentById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) commentId: number) {
    return this.commentService.deleteCommentById(userId, commentId)
  }
}
