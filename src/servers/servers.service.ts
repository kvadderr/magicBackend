import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import {
  getBanListURL,
  getLeaderboardURL,
  getOnlineURL,
} from 'src/core/constant';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class ServersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly tokenService: TokenService,
  ) {}
  //*API мониторинг: https://vk.magicrust.ru/api/getOnline
  //*API leaderboard: https://stat.magic-rust.ru/api/getPublicData.php?server=1
  async getServerStat() {
    const serverData = await firstValueFrom(
      this.httpService.get(getOnlineURL).pipe(
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
        this.httpService.get(getOnlineURL).pipe(
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

  async getLeaderboard(
    id: number,
    count: number,
    page: number,
    token?: string,
  ) {
    const serverInfo = await this.prisma.server.findFirstOrThrow({
      where: {
        id,
      },
    });

    const leaderboard: PlayerObject = (
      await firstValueFrom(
        this.httpService.get(`${getLeaderboardURL}${serverInfo.serverID}`).pipe(
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

    if (token) {
      const isUser = await this.tokenService.validateAccessToken(token);

      if (!isUser) {
        throw new HttpException(
          'Пользователь не найден или срок действия токена истек',
          HttpStatus.BAD_REQUEST,
        );
      }
      let pos = -1;
      let data;
      for (const player of sortedArray) {
        for (const playerId in player) {
          player[playerId].pos = sortedArray.indexOf(player) + 1;
          if (player[playerId].data.name === isUser.name) {
            pos = sortedArray.indexOf(player);
            data = player[playerId];
          }
        }
      }

      const leaderArr = sortedArray.slice(2);

      if (pos != -1) {
        return {
          leaderboard: sortedArray.slice(
            (page - 1) * count + 3,
            page * count + 3,
          ),
          pages:
            leaderArr.length > count ? Math.round(leaderArr.length / count) : 1,
          userData: { data, pos: pos + 1 },
        };
      } else {
        const leaderArr = sortedArray.slice(2);
        return {
          leaderboard: sortedArray.slice(
            (page - 1) * count + 3,
            page * count + 3,
          ),
          pages:
            leaderArr.length > count ? Math.round(leaderArr.length / count) : 1,
        };
      }
    }

    for (const player of sortedArray) {
      for (const playerId in player) {
        player[playerId].pos = sortedArray.indexOf(player) + 1;
      }
    }

    const leaderArr = sortedArray.slice(2);

    return {
      leaderboard: sortedArray.slice((page - 1) * count + 3, page * count + 3),
      pages:
        leaderArr.length > count ? Math.round(leaderArr.length / count) : 1,
    };
  }

  async getTopOfLeaderboard(id: number) {
    const serverInfo = await this.prisma.server.findFirstOrThrow({
      where: {
        id,
      },
    });

    const leaderboard: PlayerObject = (
      await firstValueFrom(
        this.httpService.get(`${getLeaderboardURL}${serverInfo.serverID}`).pipe(
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

    for (const player of sortedArray) {
      for (const playerId in player) {
        player[playerId].pos = sortedArray.indexOf(player) + 1;
        if (sortedArray.indexOf(player) + 1 == 3) break;
      }
    }

    return sortedArray.slice(0, 3);
  }

  async getServers() {
    return this.prisma.server.findMany();
  }

  async getListServers() {
    return this.prisma.server.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async getBanned(count: number, page: number, searchValue?: string) {
    const banlist: BanList[] = (
      await firstValueFrom(
        this.httpService.get(getBanListURL).pipe(
          catchError((error: AxiosError) => {
            console.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
      )
    ).data;

    if (searchValue) {
      const lowercaseSearchValue = searchValue.toLowerCase();

      const banResult = banlist.filter(
        (item) =>
          item.nickname.toLowerCase().includes(lowercaseSearchValue) ||
          item.steamid.includes(searchValue),
      );

      return {
        banlist: banResult.slice((page - 1) * count, page * count),
        pages:
          banResult.length > count ? Math.ceil(banResult.length / count) : 1,
      };
    }
    return {
      banlist: banlist.slice((page - 1) * count, page * count),
      pages: banlist.length > count ? Math.ceil(banlist.length / count) : 1,
    };
  }

  async getServersByType(id: number) {
    return this.prisma.server.findMany({
      where: {
        serverTypeId: id,
      },
    });
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
  pos?: number;
};

type PlayerObject = {
  [key: string]: Player;
};

type BanList = {
  steamid: string;
  nickname: string;
  reason: string;
  time: number;
  banip: number;
};
