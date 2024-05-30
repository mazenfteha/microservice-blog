import { Controller, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtGuard } from '@app/comman';
import { GetUser } from 'apps/user/src/decorator';

@UseGuards(JwtGuard)
@Controller('/api/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(@GetUser('id') userId: number) {
    return this.notificationService.getUserNotifications(userId);
  }

  @Patch(':id/seen')
  async markAsSeen(@Param('id', ParseIntPipe) notificationId: number, @GetUser('id') userId: number) {
    return this.notificationService.markAsSeen(notificationId, userId);
  }
}
