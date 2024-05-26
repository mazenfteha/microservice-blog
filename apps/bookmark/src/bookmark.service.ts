import { PrismaService } from '@app/comman/prisma/prisma.service';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

      const existingBookmark = await this.prisma.bookmark.findFirst({
        where: {
          userId: userId,
          postId: dto.postId,
        },
      });

      if (existingBookmark) {
        throw new ForbiddenException('Bookmark already exists for this post');
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

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      }
    })
    if(!bookmark || bookmark.userId !== userId){
      throw new ForbiddenException(`Access denied`);
    }
    await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      }
    })
    return { message: `Bookmark with ID ${bookmarkId} deleted` };
  }
}
