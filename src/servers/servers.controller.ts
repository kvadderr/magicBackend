import { Body, Controller, Get, Headers, Param, Query } from '@nestjs/common';
import { ServersService } from './servers.service';
import { GetLeaderboardDto } from './dto/getLeaderboard';

@Controller('servers')
export class ServersController {
  constructor(private readonly serverService: ServersService) {}

  @Get('/')
  getStats() {
    return this.serverService.getOnline();
  }

  @Get('/leaders/?')
  getLeaderboard(
    @Query('page') page: string,
    @Query('count') count: string,
    @Query('id') id: string,
    @Headers('Authorization') authorization,
  ) {
    try {
      if (authorization) {
        const token = authorization.split(' ')[1];
        return this.serverService.getLeaderboard(
          Number(id),
          Number(count),
          Number(page),
          token,
        );
      }
      return this.serverService.getLeaderboard(
        Number(id),
        Number(count),
        Number(page),
      );
    } catch (error) {
      throw error;
    }
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
