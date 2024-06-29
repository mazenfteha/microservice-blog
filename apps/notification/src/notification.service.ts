import { ForbiddenException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@app/comman/prisma/prisma.service';
import { RabbitMQService } from '@app/comman/rabbitmq/rabbitmq.service';
import * as amqp from 'amqplib';



@Injectable()
export class NotificationService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private readonly rabbitMQService: RabbitMQService
  ){}
  async onModuleInit() {
    await this.rabbitMQService.consumeMessages('user.created', this.handleUserCreated.bind(this));
    await this.rabbitMQService.consumeMessages('post.created', this.handlePostCreated.bind(this));
    await this.rabbitMQService.consumeMessages('comment.created', this.handleCommentCreated.bind(this));
    await this.rabbitMQService.consumeMessages('react.created', this.handleReactCreated.bind(this));

  }

  private handleReactCreated(msg: amqp.Message) {
    const post = JSON.parse(msg.content.toString());
    this.notifyFollowerUsers(post);
  }

  private async notifyFollowerUsers(postReaction: any) {
    // Fetch the email of the user who liked the post
  const userWhoLiked = await this.prisma.user.findUnique({
    where: { id: postReaction.userId },
    select: { email: true }
  });

  if (!userWhoLiked) {
    console.error("User who liked the post not found");
    return;
  }

  const userWhoLikedEmail = userWhoLiked.email;

  // Fetch the followers of the user who liked the post
  const followers = await this.prisma.user.findMany({
    where: {
      followers: {
        some: {
          followingId: postReaction.userId
        }
      }
    },
    select: {
      id: true, // Select the id of the followers
      email: true
    }
  });

  // Notify each follower
  followers.forEach(async follower => {
    console.log(`Notifying follower ${follower.email} that the post was liked by ${userWhoLikedEmail}`);
    await this.prisma.notification.create({
      data: {
        userId: follower.id,
        content: `The post was liked by ${userWhoLikedEmail}`,
        type: 'NEW_REACTION'
      }
    });
  });
  }


  private handleCommentCreated(msg: amqp.Message) {
    const comment = JSON.parse(msg.content.toString());
    this.notifyUsersWhoCommented(comment);
  }

  private async notifyUsersWhoCommented(comment: any) {
    const userWhoCommeted = await this.prisma.user.findUnique({
      where: { id: comment.userId },
      select: { email: true }
    });
  
    if (!userWhoCommeted) {
      console.error("User who commented the post not found");
      return;
    }
  
    const userWhoCommentEmail = userWhoCommeted.email;
    // First Fetch all distinct users who have commented on the same post, excluding the current commenter
    const commenters = await this.prisma.comment.findMany({
      where: {
        postId: comment.postId,
        NOT: {
          userId: comment.userId // Exclude the current commenter
        }
      },
      select: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
      distinct: ['userId']
    })

    // Notify each user 
    commenters.forEach(async (commenter) => {
      console.log(`Notifying ${commenter.user.email} about a new comment on post ${comment.postId}`);
      await this.prisma.notification.create({
        data: {
          userId: commenter.user.id,
          content: `New comment on post you commented on by ${userWhoCommentEmail}`,
          type: 'NEW_COMMENT'
        },
      });
    })
  }

  private async handlePostCreated(msg: amqp.Message) {
    const post = JSON.parse(msg.content.toString());
    await this.notifyFollowers(post);
  }

  private async notifyFollowers(post: any) {

    const postWithAuthor = await this.prisma.post.findUnique({
      where: { id: post.id },
      select: {
        author: {
          select: {
            email: true, // Selecting the author's email
          }
        }
      }
    });
  
    if (!postWithAuthor) {
      console.error("Post not found");
      return;
    }
  
    const authorEmail = postWithAuthor.author.email;

    const followers = await this.prisma.user.findMany({
      where: {
        followers: {
          some: {
            followingId: post.author.id,
          }
        }
      },
      select: {
        id: true, // Select the id of the followers
        email: true
      }
    });
    
    followers.forEach(async follower => {
      console.log(`Notifying follower ${follower.email} about new post by ${authorEmail}`);
      // Implementation to send notification
      await this.prisma.notification.create({
        data: {
        userId: follower.id,
        content: `New post by ${authorEmail}`,
        type: 'NEW_POST'
        }
      });
    });
  }


  private handleUserCreated(msg: amqp.Message) {
    const user = JSON.parse(msg.content.toString());
    this.sendWelcomeNotification(user);
  }

  private  async sendWelcomeNotification(user: any) {
    console.log(`Sending welcome notification to ${user.email}`);
    await this.prisma.notification.create({
      data: {
        userId: user.id,
        content: 'Welcome to our service',
        type: 'WELCOME',
        createdAt: new Date(),
      }
    });
  }

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
