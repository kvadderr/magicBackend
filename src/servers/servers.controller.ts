import { Controller, Get, Param, Query } from '@nestjs/common';
import { ServersService } from './servers.service';

@Controller('servers')
export class ServersController {
  constructor(private readonly serverService: ServersService) {}

  @Get('/')
  getStats() {
    return this.serverService.getOnline();
  }

  @Get('/leaders/:id')
  getLeaderboard(@Param('id') id: string) {
    return this.serverService.getLeaderboard(+id);
  }

  @Get('/server')
  getServer() {
    return this.serverService.getServers();
  }

  @Get('/upload')
  getServerInDB() {
    return this.serverService.getServerStat();
  }

  @Get('/ban/?')
  getBanList(
    @Query('page') page: string,
    @Query('count') count: string,
    @Query('searchValue') searchValue: string,
  ) {
    return this.serverService.getBanned(
      Number(count),
      Number(page),
      searchValue,
    );
  }
}
