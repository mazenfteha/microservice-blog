import { PrismaService } from '@app/comman/prisma/prisma.service';
import { NotificationService } from './notification.service';
import { Test } from '@nestjs/testing';
import { RabbitMQService } from '@app/comman/rabbitmq/rabbitmq.service';

const mock_user = {
  id: 1,
  email: 'tst@tst.com',
  name: 'test',
};

const mock_postReaction = {
  userId: 1,
  postId: 1,
  reaction: 'like',
  id: 1,
};
const mock_notification = {
  id: 1,
  userId: 1,
  content: 'test',
  seen: false,
};

const mock_comment = {
  id: 1,
  content: 'test',
  userId: 1,
  postId: 1,
  user: mock_user,
};

const mock_post = {
  id: 1,
  content: 'test',
  userId: 1,
  author: mock_user,
};
const db = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  comment: {
    findMany: jest.fn(),
  },
  notification: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  post: {
    findUnique: jest.fn(),
  },
};

describe('Notification Service', () => {
  let notificationService: NotificationService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: db,
        },
        {
          provide: RabbitMQService,
          useValue: {},
        },
      ],
    }).compile();
    notificationService = module.get<NotificationService>(NotificationService);
    prisma = module.get<PrismaService>(PrismaService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(notificationService).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('notify Follower Users', () => {
    it('should notify follower users', async () => {
      db.user.findUnique.mockResolvedValue(mock_user);
      db.user.findMany.mockResolvedValue([mock_user, mock_user]);
      db.notification.create.mockResolvedValue(mock_notification);
      await notificationService['notifyFollowerUsers'](mock_postReaction);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.notification.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('notifyUsersWhoCommented', () => {
    it('should notify users who commented', async () => {
      db.user.findUnique.mockResolvedValue(mock_user);
      db.comment.findMany.mockResolvedValue([
        { user: mock_user },
        { user: mock_user },
      ]);
      db.notification.create.mockResolvedValue(mock_notification);
      await notificationService['notifyUsersWhoCommented'](mock_comment);
      expect(prisma.comment.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.notification.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('notifyFollowers', () => {
    it('should notify followers', async () => {
      db.post.findUnique.mockResolvedValue(mock_post);
      db.user.findMany.mockResolvedValue([mock_user, mock_user]);
      db.notification.create.mockResolvedValue(mock_notification);
      await notificationService['notifyFollowers'](mock_post);
      expect(prisma.post.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.notification.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('getUserNotifications', () => {
    it('should return all user notification', async () => {
      db.notification.findMany.mockResolvedValue([mock_notification]);
      const notifications = await notificationService.getUserNotifications(
        mock_user.id,
      );
      expect(notifications).toBeTruthy();
      notifications.forEach((notification) => {
        expect(notification).toHaveProperty('id');
        expect(notification).toHaveProperty('userId');
        expect(notification).toHaveProperty('content');
        expect(notification).toHaveProperty('seen');
      });
      expect(prisma.notification.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('markAsSeen', () => {
    it('should mark notification as seen', async () => {
      db.notification.findUnique.mockResolvedValue(mock_notification);
      db.notification.update.mockResolvedValue(mock_notification);
      const result = await notificationService.markAsSeen(
        mock_notification.id,
        mock_user.id,
      );
      expect(result).toHaveProperty('message');
      expect(prisma.notification.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.notification.update).toHaveBeenCalledTimes(1);
    });

    it('should not update if is already seen', async () => {
      db.notification.findUnique.mockResolvedValue({
        ...mock_notification,
        seen: true,
      });
      const result = await notificationService.markAsSeen(
        mock_notification.id,
        mock_user.id,
      );
      expect(result).toHaveProperty('message');
      expect(prisma.notification.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.notification.update).toHaveBeenCalledTimes(0);
    });

    it('should throw error if user not match', async () => {
      db.notification.findUnique.mockResolvedValue({
        ...mock_notification,
        userId: 2,
      });
      await expect(
        notificationService.markAsSeen(mock_notification.id, mock_user.id),
      ).rejects.toThrow();
      expect(prisma.notification.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.notification.update).toHaveBeenCalledTimes(0);
    });

    it('should throw error if notification not found', async () => {
      db.notification.findUnique.mockResolvedValue(null);
      await expect(
        notificationService.markAsSeen(mock_notification.id, mock_user.id),
      ).rejects.toThrow();
      expect(prisma.notification.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.notification.update).toHaveBeenCalledTimes(0);
    });
  });
});
