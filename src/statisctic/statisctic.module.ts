import { Module } from '@nestjs/common';
import { StatiscticController } from './statisctic.controller';
import { StatiscticService } from './statisctic.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenModule } from 'src/token/token.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [StatiscticController],
  providers: [StatiscticService, PrismaService],
  imports: [TokenModule, UsersModule],
})
export class StatiscticModule {}
