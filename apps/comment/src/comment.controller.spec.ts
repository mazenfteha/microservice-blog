import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

describe('CommentController', () => {
  let commentController: CommentController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [CommentService],
    }).compile();

    commentController = app.get<CommentController>(CommentController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(commentController.getHello()).toBe('Hello World!');
    });
  });
});
