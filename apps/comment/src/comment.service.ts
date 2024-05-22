import { PrismaService } from '@app/comman/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService){}

  async createComment(userId: number , createCommentDto: CreateCommentDto) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const post = await this.prisma.post.findUnique({ where: { id: createCommentDto.postId } });
  
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
  
      if (!post) {
        throw new NotFoundException(`Post with ID ${createCommentDto.postId} not found`);
      }

      const comment = await this.prisma.comment.create({
        data: {
          content: createCommentDto.content,
          user: {
            connect: {
              id: userId,
            },
          },
          post: {
            connect: {
              id: createCommentDto.postId,
            },
          },
        },
      });

      return comment;
    } catch (error) {
      throw error;
    }
  }
}
