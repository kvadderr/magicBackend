import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersModule } from 'src/users/users.module';
import { TokenModule } from 'src/token/token.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, PrismaService],
  imports: [HttpModule, UsersModule, TokenModule, JwtModule],
})
export class NotificationModule {}
