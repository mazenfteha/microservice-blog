import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EditUserDto, SigninDto, SignupDto } from './dto';
import { PrismaService } from '../../../libs/comman/src/prisma/prisma.service';
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from '../../../libs/comman/src/cloudinary/cloudinary.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { DeleteFollowDto } from './dto/delete-follow.dto';
import { RabbitMQService } from '@app/comman/rabbitmq/rabbitmq.service';



@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly rabbitMQService: RabbitMQService

    ){}
  async signup(dto: SignupDto) {
    try {
      // generate the password hash
      const hash = await argon.hash(dto.password)
      // save the new user in db
      const user = await this.prisma.user.create({
          data: {
              name: dto.name,
              email: dto.email,
              password: hash
          }
      })
      delete user.password
      //return the saved user
      delete user.createdAt
      delete user.updatedAt

      await this.rabbitMQService.sendMessage(
        'user.created',
        JSON.stringify(user)
      );

      return user;
    } catch (error) {
      if(error instanceof PrismaClientKnownRequestError){
        if(error.code === 'P2002'){
          throw new ForbiddenException('Email is already in use')
        }
      }
      throw error
    }
  }

  async signin(dto: SigninDto) {
    const email = dto.email
        const user = await this.prisma.user.findUnique({
            where: {
                email: email
            }
        })
        // if user does not throw exception
        if(!user) {
            throw new ForbiddenException(`User with this email ${email} does not exist`)
        }
        // compare password
        const isMatch = await argon.verify(
            user.password, 
            dto.password
            );
        if(!isMatch){
            throw new ForbiddenException('Credentials inccorect')
        }
        return this.signToken(user.id, user.email)
  }

  async signToken(userId: number, email: string) : Promise<{access_token : string}>{
    const payload = {
        userId: userId,
        email: email
    }

    const secret = this.config.get('JWT_SECRET')
    const token = await this.jwt.signAsync(payload, {
        secret: secret,
        expiresIn: '1d'
    })

    return {
        access_token : token
    }
  }

  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where:{
          id:userId,
      },
      data: {
          ...dto,
      },
  });
  delete user.password
  return user;
  }

  
  
  async updateUserProfileImage(userId: number, imageBuffer: Buffer) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

     // Upload image to Cloudinary
    const result = await this.cloudinaryService.uploadImage(imageBuffer, 'user_images');

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { profileImage: result.url },
    });

    return updatedUser;

  }

  async deleteUserProfileImage(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Delete image from Cloudinary if user has a profile image
    if (user.profileImage) {
      const publicId = user.profileImage
      await this.cloudinaryService.deleteImage(publicId);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { profileImage: null },
    });

    return { message: 'Profile image deleted successfully' };
  }

  async createFollow(userId : number, dto: CreateFollowDto) {
    try {

       // Ensure the user making the request is the follower
    if (dto.followerId !== userId) {
      throw new ConflictException('You can only follow on behalf of yourself');
    }

    if (dto.followerId === dto.followingId) {
      throw new ConflictException("You can't follow yourself");
    }


      const follower = await this.prisma.user.findUnique({
        where: { id: dto.followerId },
      });

      if (!follower) {
        throw new NotFoundException(`User with ID ${dto.followerId} not found`);
      }


      const following = await this.prisma.user.findUnique({
        where: { id: dto.followingId },
      });

      if (!following) {
        throw new NotFoundException(`User with ID ${dto.followingId} not found`);
      }
      
          // Check if the follow relationship already exists
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: dto.followerId,
          followingId: dto.followingId,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException('You are already following this user');
    }

    const follow = await this.prisma.follow.create({
      data: {
        followerId: dto.followerId,
        followingId: dto.followingId,
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: dto.followingId,
        type: 'NEW_FOLLOWER',
        followId: follow.id
      }
    })
    return follow;

    } catch (error) {
      throw error
    }
  }

  async deleteFollow(userId : number, dto: DeleteFollowDto) {
    
    // Ensure the user making the request is the follower
    if (dto.followerId !== userId) {
        throw new ConflictException('You can only unfollow on behalf of yourself');
    }

    if (dto.followerId === dto.followingId) {
      throw new ConflictException("You can't unfollow yourself");
    }

    try {
      const follower = await this.prisma.user.findUnique({
        where: { id: dto.followerId },
      });

      if (!follower) {
        throw new NotFoundException(`User with ID ${dto.followerId} not found`);
      }


      const following = await this.prisma.user.findUnique({
        where: { id: dto.followingId },
      });

      if (!following) {
        throw new NotFoundException(`User with ID ${dto.followingId} not found`);
      }

    // Check if the follow relationship already exists
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: dto.followerId,
          followingId: dto.followingId,
        },
      },
    });

    if (existingFollow) {
        await this.prisma.follow.delete({
          where: {
            followerId_followingId: {
              followerId: dto.followerId,
              followingId: dto.followingId,
            },
          },
        });
      return { message: "You are not following this user anymore" };
    } else {
      throw new ConflictException('You are not following this user');
    }
    } catch (error) {
      throw error
    }
  }

  async getFollowers(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const followers = await this.prisma.follow.findMany({
        where: {
          followingId: userId,
        },
        include: {
          follower: {
            select : {
              id: true,
              name: true,
              profileImage: true,
            }
          }
        },
      });

      return followers.map(follow => ({
        username: follow.follower.name,
        profilePicture: follow.follower.profileImage,
      }));

    } catch (error) {
      throw error
    }
  }

  async getFollowing(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const followings = await this.prisma.follow.findMany({
        where: {
          followerId: userId,
        },
        include: {
          following: {
            select : {
              id: true,
              name: true,
              profileImage: true,
            }
          }
        },
      });

      return followings.map(follow => ({
        username: follow.following.name,
        profilePicture: follow.following.profileImage,
      }));

    } catch (error) {
      throw error
    }
  }
}


