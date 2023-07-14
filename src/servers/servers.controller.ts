import { Controller, Get } from '@nestjs/common';
import { ServersService } from './servers.service';

@Controller('servers')
export class ServersController {
  constructor(private readonly serverService: ServersService) {}

  @Get('/')
  getStats() {
    return this.serverService.getServerStat();
  }
}
