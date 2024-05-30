import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/comman/prisma/prisma.service';


@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService){}

  async getUserNotifications(userId: number) {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: {userId},
        orderBy: { createdAt: 'desc' },
        include: {
          post: {
            select: {
              title: true,
              content: true,
              createdAt: true,
              author: {
                select: {
                  name: true,
                  profileImage: true,
                }
              }
            }
          },
          comment: {
            select: {
              content: true,
              createdAt: true,
              post: {
                select: {
                  title: true
                }
              },
              user: {
                select: {
                  name: true,
                  profileImage: true,
                }
              }
            }
          },
          reaction: {
            select: {
              reactionType: true,
              createdAt: true,
              post: {
                select: {
                  title: true
                }
              }
            }
          },
          follow: {
            select: {
              followerId: true,
              createdAt: true
            }
          },
        },
      })
      return notifications;
    } catch (error) {
      throw error;
    }
  }

  
  async markAsSeen(notificationId: number, userId: number) {
    try {
      const notification = await this.prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        throw new NotFoundException('Notification not found.');
      }

      if (notification.userId !== userId) {
        throw new ForbiddenException('You do not have access to this notification.');
      }

      if (notification.seen) {
        return { message: 'Notification has already been marked as seen.' };
      }

      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { seen: true }
      });

      return { message: 'Notification marked as seen successfully.' };
    } catch (error) {
      throw error;
    }
  }
}
