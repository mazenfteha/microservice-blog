import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { SignupDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@app/comman/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '@app/comman/rabbitmq/rabbitmq.service';
import { CloudinaryService } from '@app/comman/cloudinary/cloudinary.service';
import { ArgonService } from './argon.service';

const user = {
  name: 'test',
  email: 'tst@tst.com',
  password: '12345678',
};

const db = {
  user: {
    create: jest
      .fn()
      .mockResolvedValueOnce(user)
      .mockRejectedValueOnce(() => {
        throw new Error();
      }),
    findUnique: jest
      .fn()
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(null)
      .mockResolvedValue(user),
    update: jest.fn().mockResolvedValue({
      ...user,
      email: 'new@tst.com',
      name: 'test1',
      profileImage: 'image_url',
    }),
  },
  follow: {
    findUnique: jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 1,
        followerId: 1,
        followingId: 2,
      })
      .mockResolvedValueOnce({
        id: 1,
        followerId: 1,
        followingId: 2,
      })
      .mockResolvedValueOnce(null),
    create: jest.fn().mockResolvedValue({
      id: 1,
      followerId: 1,
      followingId: 2,
    }),
    delete: jest.fn().mockResolvedValue(null),
    findMany: jest
      .fn()
      .mockResolvedValueOnce([
        {
          id: 1,
          follower: {
            name: 'test',
            profileImage: 'image',
          },
        },
      ])
      .mockResolvedValue([
        {
          id: 1,
          following: {
            name: 'test',
            profileImage: 'image',
          },
        },
      ]),
  },
  notification: {
    create: jest.fn().mockResolvedValue(null),
  },
};

const argon = {
  hash: jest.fn().mockResolvedValue('hash'),
  verify: jest.fn().mockResolvedValueOnce(true).mockResolvedValue(false),
};

const jwt = {
  signAsync: jest.fn().mockResolvedValue('token'),
};

describe('UserService', () => {
  let userService: UserService;
  let prisma: PrismaService;
  let argonService: ArgonService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: ArgonService,
          useValue: argon,
        },
        { provide: JwtService, useValue: jwt },
        {
          provide: PrismaService,
          useValue: db,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockResolvedValue('secret'),
          },
        },
        {
          provide: RabbitMQService,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadImage: jest.fn().mockResolvedValue({
              url: 'https://example.com/image.jpg',
            }),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
    argonService = module.get<ArgonService>(ArgonService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should be Defined', async () => {
    expect(userService).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('Sign up', () => {
    it('should create new user', async () => {
      const dto: SignupDto = {
        name: 'test',
        email: 'unit@tst.com',
        password: '12345678',
      };

      const result = await userService.signup(dto);
      expect(result).toHaveProperty('email');
      expect(result.name).toMatch(dto.name);
    });

    it('should throw error if user already exists', async () => {
      const dto: SignupDto = {
        name: 'test',
        email: 'XXXXXXXXXXXX',
        password: '12345678',
      };

      await expect(userService.signup(dto)).rejects.toThrow();
    });
  });

  describe('sign in', () => {
    it('should sign in user', async () => {
      const dto = {
        email: 'tst@tst.com',
        password: '12345678',
      };
      const result = await userService.signin(dto);
      expect(result).toHaveProperty('access_token');
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should throw error if user not found', async () => {
      const dto = {
        email: 'XXXXXXXXXXXX',
        password: '12345678',
      };
      await expect(userService.signin(dto)).rejects.toThrow();
    });

    it('should throw error if password is incorrect', async () => {
      const dto = {
        email: 'XXXXXXXXXXX',
        password: 'XXXXXXXXXXXX',
      };

      await expect(userService.signin(dto)).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(argonService.verify).toHaveBeenCalledTimes(1);
    });
  });

  describe('editUser', () => {
    it('should edit user', async () => {
      const dto = {
        name: 'test1',
        email: 'new@tst.com',
      };
      const result = await userService.editUser(1, dto);
      expect(result).toHaveProperty('name');
      expect(result.name).toMatch(dto.name);
      expect(result.email).toMatch(dto.email);
    });
  });

  describe('updateUserProfileImage', () => {
    it('should update user profile image', async () => {
      const userId = 1;
      const updatedUser = await userService.updateUserProfileImage(
        userId,
        new Buffer(''),
      );
      expect(updatedUser).toHaveProperty('profileImage');
      expect(updatedUser.profileImage).toBeTruthy();
      expect(updatedUser).not.toHaveProperty('password');
    });

    it('should throw error if user not found', async () => {
      const userId = 1;
      await expect(
        userService.updateUserProfileImage(userId, new Buffer('')),
      ).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteUserProfileImage', () => {
    it('should delete user profile image', async () => {
      const userId = 1;
      const result = await userService.deleteUserProfileImage(userId);
      expect(result).toHaveProperty('message');
    });

    it('should throw error if user not found', async () => {
      const userId = 1;
      await expect(
        userService.deleteUserProfileImage(userId),
      ).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('followUser', () => {
    it('should follow user', async () => {
      const followerId = 1;
      const followingId = 2;
      const follow = {
        id: 1,
        followerId: 1,
        followingId: 2,
      };
      const result = await userService.createFollow(followerId, {
        followerId,
        followingId,
      });
      expect(result).toHaveProperty('followerId');
      expect(result).toHaveProperty('followingId');
      expect(result).toHaveProperty('id');
      expect(result.id).toBe(follow.id);
    });

    it('should throw error if follower not found', async () => {
      const followerId = 1;
      const followingId = 2;
      await expect(
        userService.createFollow(followerId, {
          followerId,
          followingId,
        }),
      ).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.follow.findUnique).not.toHaveBeenCalled();
    });

    it('should throw error if following not found', async () => {
      const followerId = 1;
      const followingId = 2;
      await expect(
        userService.createFollow(followerId, {
          followerId,
          followingId,
        }),
      ).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
      expect(prisma.follow.findUnique).not.toHaveBeenCalled();
    });

    it('should throw error if follow relationship already exists', async () => {
      const followerId = 1;
      const followingId = 2;
      await expect(
        userService.createFollow(followerId, {
          followerId,
          followingId,
        }),
      ).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
      expect(prisma.follow.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('un follow User', () => {
    it('should un follow user', async () => {
      const followerId = 1;
      const followingId = 2;
      await userService.deleteFollow(followerId, {
        followerId,
        followingId,
      });
    });

    it('should throw if follower not found', async () => {
      const followerId = 1;
      const followingId = 2;
      await expect(
        userService.deleteFollow(followerId, {
          followerId,
          followingId,
        }),
      ).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should throw if following not found', async () => {
      const followerId = 1;
      const followingId = 2;
      await expect(
        userService.deleteFollow(followerId, {
          followerId,
          followingId,
        }),
      ).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
    });

    it('should throw if there is no follow', async () => {
      const followerId = 1;
      const followingId = 2;
      await expect(
        userService.deleteFollow(followerId, {
          followerId,
          followingId,
        }),
      ).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
      expect(prisma.follow.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('get my followers', () => {
    it('should return my followers', async () => {
      const userId = 1;
      const result = await userService.getFollowers(userId);
      result.forEach((follower) => {
        expect(follower).toHaveProperty('username');
        expect(follower).toHaveProperty('profilePicture');
      });
    });

    it('should throw if user not found', async () => {
      const userId = 1;
      await expect(userService.getFollowers(userId)).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('get my followings', () => {
    it('should return my followings', async () => {
      const userId = 1;
      const result = await userService.getFollowing(userId);
      result.forEach((follower) => {
        expect(follower).toHaveProperty('username');
        expect(follower).toHaveProperty('profilePicture');
      });
    });

    it('should throw if user not found', async () => {
      const userId = 1;
      await expect(userService.getFollowing(userId)).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });
});
