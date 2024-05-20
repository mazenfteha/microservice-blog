import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '@app/comman/prisma/prisma.service';
import { CloudinaryService } from '@app/comman/cloudinary/cloudinary.service';
import { EditPostDto } from './dto/edit-post.dto';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    ){}


  async createPost(userId:number , createPostDto: CreatePostDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const post = await this.prisma.post.create({
        data: {
          title: createPostDto.title,
          content: createPostDto.content,
          category: createPostDto.category,
          tag: createPostDto.tags,
          status: createPostDto.status,
          image: createPostDto.imageUrl,
          author: {
            connect: {
              id: userId,
            },
          },
        },
        select : {
          title : true,
          content : true,
          category : true,
          tag : true,
          status : true,
          image: true,
          author: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          createdAt: true
        }
      });
      return post;
    } catch (error) {
      throw error;
    }
  }

  
  async uploadPostImage(userId: number, buffer: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

     // Upload image to Cloudinary
    const result = await this.cloudinaryService.uploadImage(buffer, 'post_images');

    return { url: result.url }
  }

  async getAllPosts() {
    try {
      const posts = await this.prisma.post.findMany({
        select: {
          title: true,
          content: true,
          category: true,
          tag: true,
          status: true,
          image: true,
          author: {
            select: {
              name: true,
              profileImage: true,
            },
          },
          reactions: {
            select: {
              user: {
                select: {
                  name: true,
                  profileImage: true
                }
              },
              reactionType: true
            }
          },
          createdAt: true
        }
      });
      return posts
    } catch (error) {
      throw error;
    }
  }

  async getUserPosts(userId: number) {
    try {


      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      const posts = await this.prisma.post.findMany({
        where: {
          author: {
            id: userId,
          },
        },
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          tag: true,
          status: true,
          image: true,
          author: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          reactions: {
            select: {
              user: {
                select: {
                  name: true,
                  profileImage: true
                }
              },
              reactionType: true
            }
          },
          createdAt: true
        }
      });

      return posts;
    } catch (error) {
      throw error;
    }
  }

  async getPostById(userId: number, postId: number) {
    try {
      const post = await this.prisma.post.findFirst({
        where : {
          id : postId,
          author : {
            id : userId
          },
        },
        select : {
          authorId: true,
          title: true,
          content: true,
          category : true,
          tag: true,
          status: true,
          image: true,
          createdAt : true,
          reactions: {
            select: {
              user: {
                select: {
                  name: true,
                  profileImage: true
                }
              },
              reactionType: true
            }
          }
        }
      })
      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }
      return post
    } catch (error) {
      throw error ;
    }
  }

  async deletePostById(userId: number, postId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    })
    if (!post || post.authorId!== userId) {
      throw new ForbiddenException(`Access denied`);
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });
    return { message: `Post with ID ${postId} deleted` };
  }

  
  async editPostById(userId: number, postId: number, dto: EditPostDto) {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });
      if (!post || post.authorId!== userId) {
        throw new ForbiddenException(`Access denied`);
      }

      const updatedPost = await this.prisma.post.update({
        where : {
          id : postId
        },
        data : {
          ...dto
        }
      })

      return updatedPost
    } catch (error) {
      throw error
    }
  }

  async createReaction(userId: number, postId: number, reactionType: 'LIKE' | 'DISLIKE') {
    try {
      if (reactionType !== 'LIKE' && reactionType !== 'DISLIKE') {
        throw new BadRequestException('Invalid reaction type');
      }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const post = await this.prisma.post.findUnique({ where: { id: postId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const postReaction = await this.prisma.postReaction.upsert({
      where: { userId_postId: { userId, postId } },
      update: { reactionType },
      create: { userId, postId, reactionType },
    });

    return postReaction

    } catch (error) {
      throw error
    }
  }

  async deleteReaction(userId: number, reactionId: number) {
      // Find the reaction
      const reaction = await this.prisma.postReaction.findUnique({
        where: { id : reactionId },
      });
      if (!reaction) {
        throw new NotFoundException('Reaction not found');
      }
      // Delete the reaction
      await this.prisma.postReaction.delete({
        where: { id : reactionId },
      });
  
      return { message: 'Reaction deleted successfully' };
  }
}
