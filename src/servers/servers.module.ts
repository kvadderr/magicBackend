import { Module } from '@nestjs/common';
import { ServersController } from './servers.controller';
import { ServersService } from './servers.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { TokenModule } from 'src/token/token.module';

@Module({
  controllers: [ServersController],
  providers: [ServersService, PrismaService],
  imports: [HttpModule, TokenModule],
})
export class ServersModule {}
