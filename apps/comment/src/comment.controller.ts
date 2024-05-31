import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtGuard } from '../../../libs/comman/src/';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetUser } from 'apps/user/src/decorator';
import { EditCommentDto } from './dto/edit-comment.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('/api/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}


  @ApiOperation({ summary: 'create comment' })
  @ApiResponse({ status: 200, description: 'comment created successfully'})
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @Post('create')
  createComment(@GetUser('id') userId: number, @Body() createCommentDto: CreateCommentDto) {
    return this.commentService.createComment(userId, createCommentDto);
  }

  @ApiOperation({ summary: 'get comment' })
  @ApiResponse({ status: 200, description: 'comment retrived successfully'})
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @Get(':id')
  getPostById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) commentId: number) {
    return this.commentService.getCommentById(userId, commentId)
  }

  @ApiOperation({ summary: 'update comment' })
  @ApiResponse({ status: 200, description: 'comment updated successfully'})
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @Patch(':id')
  editPostById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) commentId: number,
    @Body() dto : EditCommentDto
    ) {
      return this.commentService.editCommentById(userId, commentId, dto)
    }

  @ApiOperation({ summary: 'delete comment' })
  @ApiResponse({ status: 200, description: 'comment deleted successfully'})
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @Delete(':id')
  deleteCommentById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) commentId: number) {
    return this.commentService.deleteCommentById(userId, commentId)
  }
}
