import { Controller, Get, Headers, Param, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  getNotificationCode(@Headers('Authorization') authorization) {
    const token = authorization.split(' ')[1];

    return this.notificationService.generateCode(token);
  }
}
