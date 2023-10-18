import { Body, Controller, Get, Headers, Param, Query } from '@nestjs/common';
import { ServersService } from './servers.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseLeaderDto } from './dto/leaderboardResponse.dto';
import { ResponseOnlineDto } from './dto/onlineResponse.dto';
import { ResponseTop3Dto } from './dto/top3Response.dto';
import { ResponseServerListDto } from './dto/serverListResponse.dto';
import { ResponseBanListDto } from './dto/banListResponse.dto';

@Controller('servers')
@ApiTags('servers')
export class ServersController {
  constructor(private readonly serverService: ServersService) {}

  @Get('/')
  @ApiOperation({ summary: 'Онлайн на серверах' })
  @ApiOkResponse({
    isArray: false,
    status: 200,
    type: ResponseOnlineDto,
  })
  getStats() {
    return this.serverService.getOnline();
  }

  @Get('/leaders/?')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Таблица лидеров' })
  @ApiOkResponse({
    isArray: false,
    status: 200,
    type: ResponseLeaderDto,
  })
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

  @Get('/top/:id')
  @ApiOperation({ summary: 'Получение топ-3 сервера' })
  @ApiOkResponse({
    isArray: false,
    status: 200,
    type: ResponseTop3Dto,
  })
  getTop(@Param('id') id: string) {
    return this.serverService.getTopOfLeaderboard(Number(id));
  }

  @Get('/server')
  @ApiOperation({ summary: 'Получение списка серверов' })
  @ApiOkResponse({
    isArray: true,
    status: 200,
    type: ResponseServerListDto,
  })
  getServer() {
    return this.serverService.getServers();
  }

  /* @Get('/upload')
  getServerInDB() {
    return this.serverService.getServerStat();
  } */

  @Get('/ban/?')
  @ApiOperation({ summary: 'бан лист' })
  @ApiOkResponse({
    isArray: false,
    status: 200,
    type: ResponseBanListDto,
  })
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

  @Get('/server/:id')
  @ApiOperation({ summary: 'Получение информации по конкретному серверу' })
  @ApiOkResponse({
    isArray: false,
    status: 200,
    type: ResponseServerListDto,
  })
  getServersByType(@Param('id') id: string) {
    return this.serverService.getServersByType(Number(id));
  }
}
