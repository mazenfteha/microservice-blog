import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { SignupDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@app/comman/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '@app/comman/rabbitmq/rabbitmq.service';
import { CloudinaryService } from '@app/comman/cloudinary/cloudinary.service';

const user = {
  name: 'test',
  email: 'tst@tst.com',
  password: '12345678',
};

const EMAIL_ERROR = 'xxxxxxxxxxxxxxxx';

const db = {
  user: {
    create: (dto: any) => {
      if (dto.data.email == EMAIL_ERROR) {
        throw new Error();
      }
      return user;
    },
  },
};

const jwt = {
  signAsync: jest.fn().mockResolvedValue(new Promise(() => 'token')),
};

describe('UserService', () => {
  let userService: UserService;
  let prisma: PrismaService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: JwtService, useValue: jwt },
        {
          provide: PrismaService,
          useValue: db,
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: RabbitMQService,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
        {
          provide: CloudinaryService,
          useValue: {},
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
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

    it(' should throw error if email is already in use ', async () => {
      const dto: SignupDto = {
        name: 'test',
        email: EMAIL_ERROR,
        password: '12345678',
      };

      await expect(userService.signup(dto)).rejects.toThrow();
    });
  });
});
