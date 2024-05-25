import { PrismaService } from '@app/comman/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService){}

  
  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const post = await this.prisma.post.findUnique({ where: { id: dto.postId } });
  
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
  
      if (!post) {
        throw new NotFoundException(`Post with ID ${dto.postId} not found`);
      }

      await this.prisma.bookmark.create({
        data: {
          userId,
          postId: dto.postId,
        },
      })
      return { message : "Post has been successfully saved",}
    } catch (error) {
      throw error
    }
  }

  async getBookmarks(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const bookmarks = await this.prisma.bookmark.findMany({
        where: {
          userId,
        },
        select: {
          post: {
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
                }
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
              comments: {
                select: {
                  user: {
                    select: {
                      name: true,
                      profileImage: true
                    }
                  },
                  content: true,
                  createdAt: true
                }
              }
            }
          }
        }
      });
      return bookmarks
    } catch (error) {
      throw error
    }
  }
}
