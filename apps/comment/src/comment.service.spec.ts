import { Test } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { PrismaService } from '@app/comman/prisma/prisma.service';
import { RabbitMQService } from '@app/comman/rabbitmq/rabbitmq.service';

const db = {
  user: {
    findUnique: jest.fn(),
  },
  post: {
    findUnique: jest.fn(),
  },
  comment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  notification: {
    create: jest.fn(),
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

const mock_comment = {
  id: 1,
  content: 'This is a test comment.',
  userId: 1,
  postId: 1,
};

const mock_notification = {
  id: 1,
  userId: 1,
  type: 'NEW_COMMENT',
};

describe('Comments Service', () => {
  let commentService: CommentService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: PrismaService,
          useValue: db,
        },
        {
          provide: RabbitMQService,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
      ],
    }).compile();
    commentService = module.get<CommentService>(CommentService);
    prisma = module.get<PrismaService>(PrismaService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(commentService).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('create Comment', () => {
    it('should create comment', async () => {
      const dto = {
        postId: 1,
        content: 'test comment',
      };

      db.user.findUnique.mockResolvedValue(mock_user);
      db.post.findUnique.mockResolvedValue(mock_post);
      db.comment.create.mockResolvedValue(mock_comment);
      db.notification.create.mockResolvedValue(mock_notification);
      const result = await commentService.createComment(1, dto);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('content');
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.post.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.comment.create).toHaveBeenCalledTimes(1);
      expect(prisma.notification.create).toHaveBeenCalledTimes(1);
    });

    it('should throw if user not found', async () => {
      const dto = {
        postId: 1,
        content: 'test comment',
      };
      db.user.findUnique.mockResolvedValue(null);
      await expect(commentService.createComment(1, dto)).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.post.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.comment.create).toHaveBeenCalledTimes(0);
      expect(prisma.notification.create).toHaveBeenCalledTimes(0);
    });

    it('should throw if post not found', async () => {
      const dto = {
        postId: 1,
        content: 'test comment',
      };
      db.user.findUnique.mockResolvedValue(mock_user);
      db.post.findUnique.mockResolvedValue(null);
      await expect(commentService.createComment(1, dto)).rejects.toThrow();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.post.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.comment.create).toHaveBeenCalledTimes(0);
      expect(prisma.notification.create).toHaveBeenCalledTimes(0);
    });
  });

  describe('get Comment', () => {
    it('should get comment', async () => {
      db.user.findUnique.mockResolvedValue(mock_user);
      db.comment.findUnique.mockResolvedValue(mock_comment);
      db.comment.findFirst.mockResolvedValue({
        ...mock_comment,
        user: mock_user,
        post: mock_post,
      });
      const result = await commentService.getCommentById(1, 1);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('post');
      expect(result).toHaveProperty('user');
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.comment.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.comment.findFirst).toHaveBeenCalledTimes(1);
    });

    it('should throw if comment not found', async () => {
      db.user.findUnique.mockResolvedValue(mock_user);
      db.comment.findUnique.mockResolvedValue(null);
      await expect(commentService.getCommentById(1, 1)).rejects.toThrow();
      expect(prisma.comment.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.comment.findFirst).toHaveBeenCalledTimes(0);
    });

    it('should throw if user not found', async () => {
      db.user.findUnique.mockResolvedValue(null);
      db.comment.findUnique.mockResolvedValue(mock_comment);
      await expect(commentService.getCommentById(1, 1)).rejects.toThrow();
      expect(prisma.comment.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.comment.findFirst).toHaveBeenCalledTimes(0);
    });
  });

  describe('editCommentById', () => {
    it('should edit comment by id', async () => {
      const dto = {
        content: 'edited comment',
      };

      db.comment.findUnique.mockResolvedValue(mock_comment);
      db.comment.update.mockResolvedValue({
        ...mock_comment,
        ...dto,
      });
      const result = await commentService.editCommentById(1, 1, dto);
      expect(result).toHaveProperty('id');
      expect(result.content).toMatch(dto.content);
      expect(prisma.comment.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.comment.update).toHaveBeenCalledTimes(1);
    });

    it('should throw if comment not found ', async () => {
      const dto = {
        content: 'edited comment',
      };

      db.comment.findUnique.mockResolvedValue(null);
      await expect(commentService.editCommentById(1, 1, dto)).rejects.toThrow();
      expect(prisma.comment.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.comment.update).toHaveBeenCalledTimes(0);
    });
  });

  describe('deleteCommentById', () => {
    it('should delete comment by id', async () => {
      db.comment.findUnique.mockResolvedValue(mock_comment);
      db.comment.delete.mockResolvedValue(mock_comment);
      const result = await commentService.deleteCommentById(1, 1);
      expect(result).toHaveProperty('message');
      expect(prisma.comment.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.comment.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw if comment not found ', async () => {
      db.comment.findUnique.mockResolvedValue(null);
      await expect(commentService.deleteCommentById(1, 1)).rejects.toThrow();
      expect(prisma.comment.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.comment.delete).toHaveBeenCalledTimes(0);
    });

    it('should throw if user not the owner ', async () => {
      db.comment.findUnique.mockResolvedValue(mock_comment);
      await expect(commentService.deleteCommentById(2, 1)).rejects.toThrow();
      expect(prisma.comment.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.comment.delete).toHaveBeenCalledTimes(0);
    });
  });
});
