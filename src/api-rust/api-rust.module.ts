import { Module } from '@nestjs/common';
import { ApiRustController } from './api-rust.controller';
import { ApiRustService } from './api-rust.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ApiRustController],
  providers: [ApiRustService, PrismaService],
})
export class ApiRustModule {}
