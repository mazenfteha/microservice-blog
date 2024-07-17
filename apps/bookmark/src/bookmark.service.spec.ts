import { PrismaService } from '@app/comman/prisma/prisma.service';
import { Test } from '@nestjs/testing';
import { BookmarkService } from './bookmark.service';

const db = {
  bookmark: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  post: {
    findUnique: jest.fn(),
  },
};

const mock_user = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
};

const mock_post = {
  id: 1,
  title: 'Test Post',
  content: 'This is a test post.',
};

const mock_bookmark = {
  id: 1,
  userId: 1,
  postId: 1,
};

describe('Bookmark service', () => {
  let bookmarkService: BookmarkService;
  let prisma: PrismaService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BookmarkService,
        {
          provide: PrismaService,
          useValue: db,
        },
      ],
    }).compile();

    bookmarkService = module.get<BookmarkService>(BookmarkService);
    prisma = module.get<PrismaService>(PrismaService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(bookmarkService).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('create bookmark', () => {
    it('should create bookmark', async () => {
      db.user.findUnique.mockResolvedValue(mock_user);
      db.post.findUnique.mockResolvedValue(mock_post);
      db.bookmark.findFirst.mockResolvedValue(null);
      db.bookmark.create.mockResolvedValue(mock_bookmark);
      const result = await bookmarkService.createBookmark(1, { postId: 1 });
      expect(result).toHaveProperty('message');
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.post.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.bookmark.findFirst).toHaveBeenCalledTimes(1);
      expect(prisma.bookmark.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error when user not found', async () => {
      db.user.findUnique.mockResolvedValue(null);
      await expect(
        bookmarkService.createBookmark(1, { postId: 1 }),
      ).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.post.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.bookmark.findFirst).toHaveBeenCalledTimes(0);
      expect(prisma.bookmark.create).toHaveBeenCalledTimes(0);
    });
    it('should throw error when post not found', async () => {
      db.user.findUnique.mockResolvedValue(mock_user);
      db.post.findUnique.mockResolvedValue(null);
      await expect(
        bookmarkService.createBookmark(1, { postId: 1 }),
      ).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.post.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.bookmark.findFirst).toHaveBeenCalledTimes(0);
      expect(prisma.bookmark.create).toHaveBeenCalledTimes(0);
    });
    it('should throw error when bookmark already exists', async () => {
      db.user.findUnique.mockResolvedValue(mock_user);
      db.post.findUnique.mockResolvedValue(mock_post);
      db.bookmark.findFirst.mockResolvedValue(mock_bookmark);
      await expect(
        bookmarkService.createBookmark(1, { postId: 1 }),
      ).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.post.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.bookmark.findFirst).toHaveBeenCalledTimes(1);
      expect(prisma.bookmark.create).toHaveBeenCalledTimes(0);
    });
  });

  describe('get all bookmarks', () => {
    it('should get all bookmarks', async () => {
      db.user.findUnique.mockResolvedValue(mock_user);
      db.bookmark.findMany.mockResolvedValue([
        { ...mock_bookmark, post: mock_post },
      ]);
      const result = await bookmarkService.getBookmarks(1);
      expect(result).toHaveLength(1);
      expect(prisma.bookmark.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should throw error if use not found', async () => {
      db.user.findUnique.mockResolvedValue(null);

      await expect(bookmarkService.getBookmarks(1)).rejects.toThrow();
      expect(prisma.bookmark.findMany).toHaveBeenCalledTimes(0);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete bookmark', () => {
    it('should delete bookmark', async () => {
      db.bookmark.findUnique.mockResolvedValue(mock_bookmark);
      db.bookmark.delete.mockResolvedValue(true);
      const result = await bookmarkService.deleteBookmarkById(1, 1);
      expect(result).toHaveProperty('message');
      expect(prisma.bookmark.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.bookmark.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw error if bookmark not found', async () => {
      db.bookmark.findUnique.mockResolvedValue(null);

      await expect(bookmarkService.deleteBookmarkById(1, 1)).rejects.toThrow();
      expect(prisma.bookmark.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.bookmark.delete).toHaveBeenCalledTimes(0);
    });

    it("should throw error if bookmark's user not match with current user", async () => {
      db.bookmark.findUnique.mockResolvedValue({
        ...mock_bookmark,
        user: mock_user,
      });

      await expect(bookmarkService.deleteBookmarkById(2, 1)).rejects.toThrow();
      expect(prisma.bookmark.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.bookmark.delete).toHaveBeenCalledTimes(0);
    });
  });
});
