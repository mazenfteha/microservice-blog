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

// const EMAIL_ERROR = 'xxxxxxxxxxxxxxxx';

const db = {
  user: {
    create: jest.fn().mockResolvedValue(user),
    findUnique: jest.fn().mockResolvedValue(user),
  },
};

const argon = {
  hash: jest.fn().mockResolvedValue('hash'),
  verify: jest.fn().mockResolvedValue(true),
};

const jwt = {
  signAsync: jest.fn().mockResolvedValue('token'),
};

describe('UserService', () => {
  let userService: UserService;
  let prisma: PrismaService;
  beforeAll(async () => {
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
  });
});

const dbException = {
  user: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(() => {
      throw new Error();
    }),
  },
};

describe('user service handling exception ', () => {
  let userService: UserService;
  let prisma: PrismaService;
  beforeAll(async () => {
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
          useValue: dbException,
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
          useValue: {},
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should services to be defined', () => {
    expect(userService).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('sign up with error', () => {
    it('should throw error if email already exist', async () => {
      const dto: SignupDto = {
        name: 'test',
        email: 'XXXXXXXXXXXX',
        password: '12345678',
      };

      await expect(userService.signup(dto)).rejects.toThrow();
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('sign in with error', () => {
    it('should throw error if email does not exist', async () => {
      const dto = {
        email: 'XXXXXXXXXXXX',
        password: '12345678',
      };

      await expect(userService.signin(dto)).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });
});
