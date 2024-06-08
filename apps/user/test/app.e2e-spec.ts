import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { UserModule } from './../src/user.module';
import { PrismaClient } from '@prisma/client';
import { join } from 'path';





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
  describe('User Profile', () => {
    it('should retrieve the user profile', async () => {
      const signupDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'strongpassword123'
      };
  
      await request(app.getHttpServer())
        .post('/api/users/auth/signup')
        .send(signupDto)
        .expect(201);
  
      const signinDto = {
        email: 'john@example.com',
        password: 'strongpassword123'
      };
  
      const signinResponse = await request(app.getHttpServer())
        .post('/api/users/auth/signin')
        .send(signinDto)
        .expect(200);

      const { access_token } = signinResponse.body;

      const profileResponse = await request(app.getHttpServer())
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200);

      expect(profileResponse.body).toEqual({
        id: expect.any(Number),
        name: 'John Doe',
        email: 'john@example.com',
        password: undefined,
        profileImage: null, 
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    })

    it('should not retrieve the user profile if token not correct', async () => {
      const signupDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'strongpassword123'
      };
  
      await request(app.getHttpServer())
        .post('/api/users/auth/signup')
        .send(signupDto)
        .expect(201);
  
      const signinDto = {
        email: 'john@example.com',
        password: 'strongpassword123'
      };
  
      await request(app.getHttpServer())
        .post('/api/users/auth/signin')
        .send(signinDto)
        .expect(200);

      const profileResponse = await request(app.getHttpServer())
      .get('/api/users/profile')
      .set('Authorization', `Bearer invalid_token_here`)
      .expect(401);

      expect(profileResponse.body).toEqual({
        message: "Unauthorized",
        statusCode: 401
      });
    })

    it('should update the user profile', async () => {
      // First, create a user to sign in with
      const signupDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'strongpassword123'
      };
  
      await request(app.getHttpServer())
        .post('/api/users/auth/signup')
        .send(signupDto)
        .expect(201);
  
      // Sign in to get the access token
      const signinDto = {
        email: 'john@example.com',
        password: 'strongpassword123'
      };
  
      const signinResponse = await request(app.getHttpServer())
        .post('/api/users/auth/signin')
        .send(signinDto)
        .expect(200);
  
      const { access_token } = signinResponse.body;
  
      const editDto = {
        name: 'John Updated',
      };
  
      const updateResponse = await request(app.getHttpServer())
        .patch('/api/users/edit/profile')
        .set('Authorization', `Bearer ${access_token}`)
        .send(editDto)
        .expect(200);
  
      expect(updateResponse.body).toEqual({
        id: expect.any(Number),
        name: 'John Updated',
        email: 'john@example.com',
        password: undefined,
        profileImage: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });
  
    it('should not update the user profile if token not correct', async () => {
      const updateResponse = await request(app.getHttpServer())
        .patch('/api/users/edit/profile')
        .set('Authorization', `Bearer invalid_token_here`)
        .send({ name: 'John Updated' })
        .expect(401);
  
      expect(updateResponse.body).toEqual({
        message: "Unauthorized",
        statusCode: 401
      });
    });

  })

  describe('User Profile Image Upload', () => {
    it('should upload and update user profile image', async () => {
      // First, create a user to sign in with
      const signupDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'strongpassword123'
      };
  
      await request(app.getHttpServer())
        .post('/api/users/auth/signup')
        .send(signupDto)
        .expect(201);
  
      // Sign in to get the access token
      const signinDto = {
        email: 'john@example.com',
        password: 'strongpassword123'
      };
  
      const signinResponse = await request(app.getHttpServer())
        .post('/api/users/auth/signin')
        .send(signinDto)
        .expect(200);
  
      const { access_token } = signinResponse.body;
  
      const imagePath = join(__dirname, '../../../docs/ronaldo-850-jpeg-1693687478-1789-1693688039.jpg'); // Replace with a valid path
      const response = await request(app.getHttpServer())
        .post('/api/users/upload/profile/image')
        .set('Authorization', `Bearer ${access_token}`)
        .attach('file', imagePath)
        .expect(201);

      expect(response.body).toHaveProperty('profileImage');
      expect(response.body.profileImage).toMatch(/cloudinary\.com/);
    }, 30000);

    it('should return an error if no file is uploaded', async () => {
      const signupDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'strongpassword123'
      };
  
      await request(app.getHttpServer())
        .post('/api/users/auth/signup')
        .send(signupDto)
        .expect(201);
  
      // Sign in to get the access token
      const signinDto = {
        email: 'john@example.com',
        password: 'strongpassword123'
      };
  
      const signinResponse = await request(app.getHttpServer())
        .post('/api/users/auth/signin')
        .send(signinDto)
        .expect(200);
  
      const { access_token } = signinResponse.body;
      const response = await request(app.getHttpServer())
        .post('/api/users/upload/profile/image')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(422);

      expect(response.body).toEqual({
        statusCode: 422,
        message: 'File is required',
        error: 'Unprocessable Entity',
      });
    });

  });
});
