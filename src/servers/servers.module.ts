import { Module } from '@nestjs/common';
import { ServersController } from './servers.controller';
import { ServersService } from './servers.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [ServersController],
  providers: [ServersService, PrismaService],
  imports: [HttpModule],
})
export class ServersModule {}
