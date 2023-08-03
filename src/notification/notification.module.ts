import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, PrismaService],
  imports: [HttpModule],
})
export class NotificationModule {}
