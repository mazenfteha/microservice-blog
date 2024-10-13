import { PrismaService } from '@app/comman/prisma/prisma.service';
import { PostService } from './post.service';
import { RabbitMQService } from '@app/comman/rabbitmq/rabbitmq.service';
import { Test } from '@nestjs/testing';
import { CloudinaryService } from '@app/comman/cloudinary/cloudinary.service';
import { ReactionType } from '@prisma/client';

const mock_user = {
  id: 1,
  email: 'tst@tst.com',
  password: '12345678',
};
const mock_post = {
  title: 'title',
  content: 'content',
  authorId: 1,
};
const mock_postReaction = {
  id: 1,
  userId: 1,
  postId: 1,
  reactionType: ReactionType.LIKE,
};
const db = {
  user: {
    findUnique: jest.fn().mockResolvedValue(mock_user),
  },
  post: {
    create: jest.fn().mockResolvedValue(mock_post),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  postReaction: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  notification: {
    create: jest.fn(),
  },
};

const rabbitMQService = {
  sendMessage: jest.fn().mockResolvedValue(true),
};

const cloudinaryService = {
  uploadImage: jest.fn(),
};

describe('Post Service', () => {
  let postService: PostService;
  let prisma: PrismaService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: PrismaService, useValue: db },
        { provide: RabbitMQService, useValue: rabbitMQService },
        { provide: CloudinaryService, useValue: cloudinaryService },
      ],
    }).compile();

    postService = module.get<PostService>(PostService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(postService).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('creating post', () => {
    it('should create a post', async () => {
      const dto = {
        title: mock_post.title,
        content: mock_post.content,
      };
      const result = await postService.createPost(1, dto);
      expect(result.title).toEqual(mock_post.title);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.post.create).toHaveBeenCalledTimes(1);
    });

    it('should throw if user not found', async () => {
      db.user.findUnique.mockResolvedValue(null);
      const dto = {
        title: mock_post.title,
        content: mock_post.content,
      };
      await expect(postService.createPost(1, dto)).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.post.create).toHaveBeenCalledTimes(0);
    });
  });

  describe('uploading post image', () => {
    it('should upload post image', async () => {
      db.user.findUnique.mockResolvedValue(mock_user);
      cloudinaryService.uploadImage.mockResolvedValue({ url: 'test' });
      const result = await postService.uploadPostImage(1, {
        buffer: Buffer.from('test'),
        options: {},
      });
      expect(result).toHaveProperty('url');
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should throw if user not found', async () => {
      db.user.findUnique.mockResolvedValue(null);
      await expect(
        postService.uploadPostImage(1, {
          buffer: Buffer.from('test'),
          options: {},
        }),
      ).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('get All posts', () => {
    it('should get all posts', async () => {
      db.post.findMany.mockResolvedValue([
        { ...mock_post, author: {}, reactions: {}, comments: {} },
      ]);
      const result = await postService.getAllPosts();
      expect(result).toBeTruthy();
      result.forEach((post) => {
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('content');
        expect(post).toHaveProperty('author');
        expect(post).toHaveProperty('reactions');
        expect(post).toHaveProperty('comments');
      });
      expect(prisma.post.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("get user's posts", () => {
    it("should get user's posts", async () => {
      db.user.findUnique.mockResolvedValue(mock_user);
      db.post.findMany.mockResolvedValue([
        { ...mock_post, author: {}, reactions: {}, comments: {} },
      ]);
      const result = await postService.getUserPosts(1);
      expect(result).toBeTruthy();
      result.forEach((post) => {
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('content');
        expect(post).toHaveProperty('author');
        expect(post).toHaveProperty('reactions');
        expect(post).toHaveProperty('comments');
      });
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.post.findMany).toHaveBeenCalledTimes(1);
    });

    it('should throw if user not found', async () => {
      db.user.findUnique.mockResolvedValue(null);
      await expect(postService.getUserPosts(1)).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.post.findMany).toHaveBeenCalledTimes(0);
    });
  });

  describe('get single post', () => {
    it('should get single post', async () => {
      db.post.findFirst.mockResolvedValue({
        ...mock_post,
        author: {},
        reactions: {},
        comments: {},
      });
      const result = await postService.getPostById(1, 1);
      expect(result).toBeTruthy();
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('author');
      expect(result).toHaveProperty('reactions');
      expect(result).toHaveProperty('comments');
      expect(prisma.post.findFirst).toHaveBeenCalledTimes(1);
    });

    it('should throw if post not found', async () => {
      db.post.findFirst.mockResolvedValue(null);
      await expect(postService.getPostById(1, 1)).rejects.toThrow();
      expect(prisma.post.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe('editPostById', () => {
    it('should edit post by id', async () => {
      const dto = {
        title: 'new title',
        content: 'new content',
        authorId: 1,
      };
      db.post.findUnique.mockResolvedValue(mock_post);
      db.post.update.mockResolvedValue({
        ...mock_post,
        title: 'new title',
        content: 'new content',
      });
      const result = await postService.editPostById(1, 1, dto);
      expect(result).toBeTruthy();
      expect(result).toHaveProperty('title', dto.title);
      expect(result).toHaveProperty('content', dto.content);
      expect(prisma.post.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.post.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('create Reaction ', () => {
    it('should create reaction ', async () => {
      db.post.findUnique.mockResolvedValue(mock_post);
      db.user.findUnique.mockResolvedValue(mock_user);
      db.postReaction.upsert.mockResolvedValue(mock_postReaction);
      const result = await postService.createReaction(1, 1, 'LIKE');
      expect(result).toBeTruthy();
      expect(prisma.post.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.postReaction.upsert).toHaveBeenCalledTimes(1);
    });

    it('should throw if post not found', async () => {
      db.user.findUnique.mockResolvedValue(mock_user);
      db.post.findUnique.mockResolvedValue(null);
      await expect(postService.createReaction(1, 1, 'LIKE')).rejects.toThrow();
      expect(prisma.post.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.postReaction.upsert).toHaveBeenCalledTimes(0);
    });

    it('should throw if user not found', async () => {
      db.user.findUnique.mockResolvedValue(null);
      db.post.findUnique.mockResolvedValue(mock_post);
      await expect(postService.createReaction(1, 1, 'LIKE')).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.post.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.postReaction.upsert).toHaveBeenCalledTimes(0);
    });
  });

  describe('delete Reaction', () => {
    it('should delete reaction', async () => {
      db.postReaction.findUnique.mockResolvedValue(mock_postReaction);
      db.postReaction.delete.mockResolvedValue(true);
      const result = await postService.deleteReaction(1, 1);
      expect(result).toBeTruthy();
      expect(prisma.postReaction.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.postReaction.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw if reaction not found', async () => {
      db.postReaction.findUnique.mockResolvedValue(null);
      await expect(postService.deleteReaction(1, 1)).rejects.toThrow();
      expect(prisma.postReaction.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.postReaction.delete).toHaveBeenCalledTimes(0);
    });
  });
});
