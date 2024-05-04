import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';

describe('PostController', () => {
  let postController: PostController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [PostService],
    }).compile();

    postController = app.get<PostController>(PostController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(postController.getHello()).toBe('Hello World!');
    });
  });
});
