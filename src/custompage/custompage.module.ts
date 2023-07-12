import { Module } from '@nestjs/common';
import { CustompageController } from './custompage.controller';
import { CustompageService } from './custompage.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CustompageController],
  providers: [CustompageService, PrismaService],
})
export class CustompageModule {}
