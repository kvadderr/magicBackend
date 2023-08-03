import { Controller, Get, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/:id')
  getNotificationCode(@Param('id') steamId: string) {
    return this.notificationService.generateCode(steamId);
  }
}
