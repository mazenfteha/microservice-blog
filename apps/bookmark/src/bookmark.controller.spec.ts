import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';

describe('BookmarkController', () => {
  let bookmarkController: BookmarkController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BookmarkController],
      providers: [BookmarkService],
    }).compile();

    bookmarkController = app.get<BookmarkController>(BookmarkController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(bookmarkController.getHello()).toBe('Hello World!');
    });
  });
});
