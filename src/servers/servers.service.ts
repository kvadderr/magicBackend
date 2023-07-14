import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}
  //*API мониторинг: https://vk.magicrust.ru/api/getOnline
  //*API leaderboard: https://stat.magic-rust.ru/api/getPublicData.php?server=1
  async getServerStat() {
    const serverData = await firstValueFrom(
      this.httpService.get(`https://vk.magicrust.ru/api/getOnline`).pipe(
        catchError((error: AxiosError) => {
          console.error(error.response.data);
          throw 'An error happened!';
        }),
      ),
    );

    for (let key in serverData.data) {
      await this.prisma.server.create({
        data: {
          IP: serverData.data[key].ip.split(':')[0],
          port: serverData.data[key].ip.split(':')[1],
          apiKey: 'apiKey',
          serverID: serverData.data[key].server,
          name: serverData.data[key].ip,
          serverTypeId: 1,
        },
      });
    }
  }

  async getOnline() {
    const onlineServer = (
      await firstValueFrom(
        this.httpService.get(`https://vk.magicrust.ru/api/getOnline`).pipe(
          catchError((error: AxiosError) => {
            console.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
      )
    ).data;

    const server = await this.prisma.server.findMany({
      select: {
        IP: true,
        port: true,
        name: true,
        serverID: true,
      },
    });

    let sumPlayers = 0;
    let maxServerOnline = 0;

    const result = server.map((el) => {
      const currentOnline = onlineServer[`${el.IP}:${el.port}`].players;
      const maxPlayers = onlineServer[`${el.IP}:${el.port}`].maxplayers;
      sumPlayers += onlineServer[`${el.IP}:${el.port}`].players;
      maxServerOnline += onlineServer[`${el.IP}:${el.port}`].maxplayers;
      return { ...el, currentOnline, maxPlayers };
    });

    return { result, sumPlayers, maxServerOnline };
  }

  async getLeaderboard(id: number) {
    const serverInfo = await this.prisma.server.findFirst({
      where: {
        id,
      },
    });

    if (!serverInfo) {
      throw new HttpException('Сервер не найден', HttpStatus.BAD_REQUEST);
    }

    const leaderboard: PlayerObject = (
      await firstValueFrom(
        this.httpService
          .get(
            `https://stat.magic-rust.ru/api/getPublicData.php?server=${serverInfo.serverID}`,
          )
          .pipe(
            catchError((error: AxiosError) => {
              console.error(error.response.data);
              throw 'An error happened!';
            }),
          ),
      )
    ).data;

    const sortedArray = Object.entries(leaderboard)
      .sort(([, a], [, b]) => b.stats.kp_total - a.stats.kp_total)
      .map(([key, value]) => ({ [key]: value }));

    return sortedArray;
  }

  async getServers() {
    return this.prisma.server.findMany();
  }
}

type PlayerStats = {
  p_score: number;
  kp_total: number;
  d_player: number;
  p_lastjoin: number;
};

type PlayerData = {
  name: string;
  avatar: string;
};

type Player = {
  stats: PlayerStats;
  data: PlayerData;
};

type PlayerObject = {
  [key: string]: Player;
};

const obj: PlayerObject = {
  // ... ваш исходный объект ...
};
