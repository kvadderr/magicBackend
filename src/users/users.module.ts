import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { UsersController } from './users.controller';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [HttpModule, TokenModule],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})
export class UsersModule {}
