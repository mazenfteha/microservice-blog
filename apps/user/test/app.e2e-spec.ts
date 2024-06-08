import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
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
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    )
    await app.init();
    await prisma.$connect();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
    await prisma.$disconnect();
  });

  describe('Auth', () => {
    //Register a new user
    describe('SignUp', () => {
      it('should create a user', async () => {
        const dto = {
          name: 'John Doe',
          email: 'john@gmail.com',
          password: 'strongpassword123'
        };
    
        const response = await request(app.getHttpServer())
          .post('/api/users/auth/signup')
          .send(dto)
          .expect(201);
    
        expect(response.body).toEqual({
          id: expect.any(Number),
          name: 'John Doe',
          email: 'john@gmail.com',
          password: undefined,
          profileImage: null
        });
      });
    
      it('should not create a user (with same email)', async () => {
        const dto = {
          name: 'Jane Doe',
          email: 'john@example.com', // Same email as in the previous test
          password: 'anotherstrongpassword123'
        };
    
        await request(app.getHttpServer())
        .post('/api/users/auth/signup')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'strongpassword123'
        })
        .expect(201);
    
        const response = await request(app.getHttpServer())
          .post('/api/users/auth/signup')
          .send(dto)
          .expect(400);
    
        expect(response.body).toEqual({
          message: [
            'Password must be between 8 and 20 characters'
          ],
          error: 'Bad Request',
          statusCode: 400
        });
      });

      it('should throw an error if the name is empty', async () => {
        const dto = {
          email: 'john@example.com',
          password: 'strongpassword123'
        };
    
        const response = await request(app.getHttpServer())
          .post('/api/users/auth/signup')
          .send(dto)
          .expect(400);
    
        expect(response.body).toEqual({
          error: 'Bad Request',
          statusCode: 400,
          message: [
            'name should not be empty',
            'name must be a string'
          ]
        });
      });

      it('should throw an error if the email is empty', async () => {
        const dto = {
          name: 'John Doe',
          password: 'strongpassword123'
        };
    
        const response = await request(app.getHttpServer())
          .post('/api/users/auth/signup')
          .send(dto)
          .expect(400);
    
        expect(response.body).toEqual({
          message: [
            'email should not be empty',
            'Email must be valid'
          ],
          error: 'Bad Request',
          statusCode: 400
        });
      })

      it('should throw an error if the password is empty', async () => {
        const dto = {
          name: 'John Doe',
          email: 'john@example.com'
        };
    
        const response = await request(app.getHttpServer())
          .post('/api/users/auth/signup')
          .send(dto)
          .expect(400);
    
        expect(response.body).toEqual({
          message:[
            'Password must be between 8 and 20 characters',
            'password should not be empty',
            'password must be a string',
          ],
          error: 'Bad Request',
          statusCode: 400
        });
      })

      it('should throw an error if the request body is empty', async () => {
        const response = await request(app.getHttpServer())
        .post('/api/users/auth/signup')
        .send({})
        .expect(400);
  
      expect(response.body).toEqual({
        message: [
          'name should not be empty',
          'name must be a string',
          'email should not be empty',
          'Email must be valid',
          'Password must be between 8 and 20 characters',
          'password should not be empty',
          'password must be a string',
        ],
        error: 'Bad Request',
        statusCode: 400
      });
      })
    })
    describe('SignIn', () => {
      it('it should sign in', async () =>{

        const signupDto = {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'strongpassword123'
        };
    
        await request(app.getHttpServer())
          .post('/api/users/auth/signup')
          .send(signupDto)
          .expect(201);

        const dto = {
          email: 'john@example.com',
          password: 'strongpassword123'
        };
        const response = await request(app.getHttpServer())
        .post('/api/users/auth/signin')
        .send(dto)
        .expect(200);

        expect(response.body).toHaveProperty('access_token');
        expect(typeof response.body.access_token).toBe('string');
      }
    )
    it('should not sign in if the email is empty', async () => {
      const signupDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'strongpassword123'
      };
  
      await request(app.getHttpServer())
        .post('/api/users/auth/signup')
        .send(signupDto)
        .expect(201);

      const dto = {
        password: 'strongpassword123'
      };
      const response = await request(app.getHttpServer())
      .post('/api/users/auth/signin')
      .send(dto)
      .expect(400);

      expect(response.body).toEqual({
        message: [
          'email should not be empty',
          'Email must be valid'
        ],
        error: 'Bad Request',
        statusCode: 400
      });

    })
    it('should not sign in if the password is empty', async () => {
      const signupDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'strongpassword123'
      };
  
      await request(app.getHttpServer())
        .post('/api/users/auth/signup')
        .send(signupDto)
        .expect(201);

      const dto = {
        email: 'john@example.com'
      };
      const response = await request(app.getHttpServer())
      .post('/api/users/auth/signin')
      .send(dto)
      .expect(400);

      expect(response.body).toEqual({
        message: [
          "Password must be between 8 and 20 characters",
          "password should not be empty",
          "password must be a string"
        ],
        error: 'Bad Request',
        statusCode: 400
      });
    })
    it('should not sign in if the email is not match', async () => {
      const signupDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'strongpassword123'
      };
      await request(app.getHttpServer())
        .post('/api/users/auth/signup')
        .send(signupDto)
        .expect(201);

        const dto = {
          email: 'john@example.com1',
          password: 'strongpassword123'
        };
        const response = await request(app.getHttpServer())
        .post('/api/users/auth/signin')
        .send(dto)
        .expect(400);

        expect(response.body).toEqual({
          message: [
            'Email must be valid'
          ],
          error: 'Bad Request',
          statusCode: 400
        });
    })
    it('should not sign in if the password is not match',async  () => {
      const signupDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'strongpassword123'
      };
      await request(app.getHttpServer())
        .post('/api/users/auth/signup')
        .send(signupDto)
        .expect(201);

        const dto = {
          email: 'john@example.com',
          password: 'strongpassword1234'
        };
        const response = await request(app.getHttpServer())
        .post('/api/users/auth/signin')
        .send(dto)
        .expect(403);

        expect(response.body).toEqual({
          message: 'Credentials inccorect',
          error: 'Forbidden',
          statusCode: 403
        });
    })
    })
  })
});
