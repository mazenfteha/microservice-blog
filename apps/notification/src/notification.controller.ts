import { Controller, Get, Param, ParseIntPipe, Patch, UseGuards, UseInterceptors } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtGuard } from '@app/comman';
import { GetUser } from 'apps/user/src/decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('/api/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({ summary: 'get all notifications' })
  @ApiResponse({ status: 200, description: 'notifications retrived successfully'})
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @UseInterceptors(CacheInterceptor)
  @Get()
  async getUserNotifications(@GetUser('id') userId: number) {
    return this.notificationService.getUserNotifications(userId);
  }

  @ApiOperation({ summary: 'update notification mark as seen' })
  @ApiResponse({ status: 200, description: 'notification updated successfully'})
  @ApiResponse({ status: 401, description: ' Unauthorized.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @Patch(':id/seen')
  async markAsSeen(@Param('id', ParseIntPipe) notificationId: number, @GetUser('id') userId: number) {
    return this.notificationService.markAsSeen(notificationId, userId);
  }
}
