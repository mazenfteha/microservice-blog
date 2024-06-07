import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserModule } from './../src/user.module';
import { PrismaClient } from '@prisma/client';


describe('UserController (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await prisma.$connect();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  }, 30000);

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/users')
      .expect(200)
      .expect('Hello World!');
  });

  //Register a new user
  it('POST req should create a user', async () => {
    const dto = {
      name: 'John Doe',
      email: 'john651512@gmail.com',
      password: 'strongpassword123'
    };

    const response = await request(app.getHttpServer())
      .post('/api/users/auth/signup')
      .send(dto)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(Number),
      name: 'John Doe',
      email: 'john651512@gmail.com',
      password: undefined,
      profileImage: null
    });
  });
});
