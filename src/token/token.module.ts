import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [TokenService, PrismaService],
  exports: [TokenService],
  imports: [],
})
export class TokenModule {}
